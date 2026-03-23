import fs from 'node:fs/promises';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

const DEFAULT_INPUT = path.join(projectRoot, 'public');
const DEFAULT_OUTPUT = path.join(projectRoot, 'public-optimized');

const VIDEO_EXTENSIONS = new Set(['.mp4', '.mov', '.m4v', '.webm']);
const IMAGE_EXTENSIONS = new Set(['.jpg', '.jpeg', '.png', '.webp']);

function parseArgs(argv) {
  const options = {
    input: DEFAULT_INPUT,
    output: DEFAULT_OUTPUT,
    inPlace: false,
    dryRun: false,
    maxFiles: Number.POSITIVE_INFINITY,
    videoCrf: 28,
    imageQuality: 78,
    keepLarger: false,
    ffmpegPath: null,
  };

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];

    if (arg === '--input') {
      options.input = path.resolve(projectRoot, argv[i + 1] || '');
      i += 1;
      continue;
    }

    if (arg === '--output') {
      options.output = path.resolve(projectRoot, argv[i + 1] || '');
      i += 1;
      continue;
    }

    if (arg === '--max-files') {
      const value = Number(argv[i + 1]);
      options.maxFiles = Number.isFinite(value) && value > 0 ? Math.floor(value) : options.maxFiles;
      i += 1;
      continue;
    }

    if (arg === '--video-crf') {
      const value = Number(argv[i + 1]);
      if (Number.isFinite(value) && value >= 18 && value <= 35) {
        options.videoCrf = Math.floor(value);
      }
      i += 1;
      continue;
    }

    if (arg === '--image-quality') {
      const value = Number(argv[i + 1]);
      if (Number.isFinite(value) && value >= 40 && value <= 95) {
        options.imageQuality = Math.floor(value);
      }
      i += 1;
      continue;
    }

    if (arg === '--ffmpeg') {
      const value = argv[i + 1] || '';
      options.ffmpegPath = path.resolve(projectRoot, value);
      i += 1;
      continue;
    }

    if (arg === '--in-place') {
      options.inPlace = true;
      continue;
    }

    if (arg === '--dry-run') {
      options.dryRun = true;
      continue;
    }

    if (arg === '--keep-larger') {
      options.keepLarger = true;
      continue;
    }
  }

  if (options.inPlace) {
    options.output = options.input;
  }

  return options;
}

async function fileExists(targetPath) {
  try {
    await fs.access(targetPath);
    return true;
  } catch {
    return false;
  }
}

async function detectFfmpeg(ffmpegPathFromArg = null) {
  if (ffmpegPathFromArg) {
    if (!(await fileExists(ffmpegPathFromArg))) {
      throw new Error(`Provided ffmpeg path does not exist: ${ffmpegPathFromArg}`);
    }
    return ffmpegPathFromArg;
  }

  const projectLocal = path.resolve(projectRoot, '..', '..', 'tools', 'ffmpeg', 'ffmpeg-8.0.1-essentials_build', 'bin', 'ffmpeg.exe');
  if (await fileExists(projectLocal)) {
    return projectLocal;
  }

  return 'ffmpeg';
}

async function ensureDir(targetPath) {
  await fs.mkdir(targetPath, { recursive: true });
}

async function listFilesRecursive(rootDir) {
  const results = [];

  async function walk(currentPath) {
    const entries = await fs.readdir(currentPath, { withFileTypes: true });
    for (const entry of entries) {
      const resolved = path.join(currentPath, entry.name);
      if (entry.isDirectory()) {
        await walk(resolved);
      } else if (entry.isFile()) {
        results.push(resolved);
      }
    }
  }

  await walk(rootDir);
  return results;
}

function extensionFor(filePath) {
  return path.extname(filePath).toLowerCase();
}

function isImage(filePath) {
  return IMAGE_EXTENSIONS.has(extensionFor(filePath));
}

function isVideo(filePath) {
  return VIDEO_EXTENSIONS.has(extensionFor(filePath));
}

function toRelative(fromRoot, absolutePath) {
  return path.relative(fromRoot, absolutePath).split(path.sep).join('/');
}

function qualityToJpegQscale(quality) {
  const clamped = Math.max(40, Math.min(95, quality));
  const normalized = (clamped - 40) / (95 - 40);
  const q = Math.round(12 - normalized * 10);
  return Math.max(2, Math.min(12, q));
}

function ffmpegImageArgs(inputPath, outputPath, quality) {
  const ext = extensionFor(inputPath);

  if (ext === '.jpg' || ext === '.jpeg') {
    return ['-y', '-i', inputPath, '-q:v', String(qualityToJpegQscale(quality)), outputPath];
  }

  if (ext === '.png') {
    return ['-y', '-i', inputPath, '-compression_level', '9', '-pred', 'mixed', outputPath];
  }

  if (ext === '.webp') {
    return ['-y', '-i', inputPath, '-quality', String(quality), '-compression_level', '6', outputPath];
  }

  return ['-y', '-i', inputPath, outputPath];
}

function ffmpegVideoArgs(inputPath, outputPath, videoCrf) {
  const ext = extensionFor(inputPath);

  if (ext === '.webm') {
    return [
      '-y',
      '-i',
      inputPath,
      '-c:v',
      'libvpx-vp9',
      '-crf',
      String(Math.min(videoCrf + 6, 37)),
      '-b:v',
      '0',
      '-row-mt',
      '1',
      '-c:a',
      'libopus',
      '-b:a',
      '96k',
      outputPath,
    ];
  }

  return [
    '-y',
    '-i',
    inputPath,
    '-c:v',
    'libx264',
    '-preset',
    'slow',
    '-crf',
    String(videoCrf),
    '-movflags',
    '+faststart',
    '-c:a',
    'aac',
    '-b:a',
    '128k',
    outputPath,
  ];
}

async function runCommand(cmd, args) {
  return new Promise((resolve, reject) => {
    const child = spawn(cmd, args, { stdio: ['ignore', 'pipe', 'pipe'] });
    let stderr = '';
    let stdout = '';

    child.stdout.on('data', (chunk) => {
      stdout += chunk.toString();
    });

    child.stderr.on('data', (chunk) => {
      stderr += chunk.toString();
    });

    child.on('error', (error) => {
      reject(error);
    });

    child.on('close', (code) => {
      if (code === 0) {
        resolve({ stdout, stderr });
      } else {
        reject(new Error(stderr || stdout || `Command failed with exit code ${code}`));
      }
    });
  });
}

async function copyFileWithDirs(fromPath, toPath) {
  await ensureDir(path.dirname(toPath));
  await fs.copyFile(fromPath, toPath);
}

function formatBytes(value) {
  if (value < 1024) return `${value} B`;
  if (value < 1024 * 1024) return `${(value / 1024).toFixed(1)} KB`;
  if (value < 1024 * 1024 * 1024) return `${(value / (1024 * 1024)).toFixed(2)} MB`;
  return `${(value / (1024 * 1024 * 1024)).toFixed(2)} GB`;
}

async function processWithFfmpeg({
  ffmpegPath,
  inputFile,
  outputFile,
  kind,
  options,
}) {
  const parsed = path.parse(outputFile);
  const tempOutput = path.join(parsed.dir, `${parsed.name}.tmp-${Date.now()}${parsed.ext}`);
  await ensureDir(path.dirname(outputFile));

  const args =
    kind === 'video'
      ? ffmpegVideoArgs(inputFile, tempOutput, options.videoCrf)
      : ffmpegImageArgs(inputFile, tempOutput, options.imageQuality);

  await runCommand(ffmpegPath, args);

  const inputStat = await fs.stat(inputFile);
  const tempStat = await fs.stat(tempOutput);
  const keepCompressed = options.keepLarger || tempStat.size <= inputStat.size;

  if (keepCompressed) {
    if (await fileExists(outputFile)) {
      await fs.unlink(outputFile);
    }
    await fs.rename(tempOutput, outputFile);
    return {
      original: inputStat.size,
      final: tempStat.size,
      compressed: true,
    };
  }

  await fs.unlink(tempOutput);
  if (outputFile !== inputFile) {
    await copyFileWithDirs(inputFile, outputFile);
  }
  return {
    original: inputStat.size,
    final: inputStat.size,
    compressed: false,
  };
}

async function main() {
  const options = parseArgs(process.argv.slice(2));
  const ffmpegPath = await detectFfmpeg(options.ffmpegPath);

  if (!(await fileExists(options.input))) {
    throw new Error(`Input path does not exist: ${options.input}`);
  }

  if (!options.inPlace) {
    await ensureDir(options.output);
  }

  const allFiles = await listFilesRecursive(options.input);
  const mediaFiles = allFiles.filter((file) => isImage(file) || isVideo(file));
  const filesToProcess = mediaFiles.slice(0, options.maxFiles);

  let totalBefore = 0;
  let totalAfter = 0;
  let optimizedCount = 0;
  let copiedCount = 0;

  console.log(`Input:  ${options.input}`);
  console.log(`Output: ${options.output}`);
  console.log(`ffmpeg: ${ffmpegPath}`);
  console.log(`Mode:   ${options.dryRun ? 'dry-run' : options.inPlace ? 'in-place' : 'output-folder'}`);
  console.log(`Files:  ${filesToProcess.length} media files (of ${mediaFiles.length} found)`);

  for (const inputFile of filesToProcess) {
    const relative = toRelative(options.input, inputFile);
    const outputFile = path.join(options.output, relative);
    const kind = isVideo(inputFile) ? 'video' : 'image';
    const inputStat = await fs.stat(inputFile);

    totalBefore += inputStat.size;

    if (options.dryRun) {
      totalAfter += inputStat.size;
      console.log(`[DRY] ${kind.toUpperCase()} ${relative} (${formatBytes(inputStat.size)})`);
      continue;
    }

    try {
      const result = await processWithFfmpeg({
        ffmpegPath,
        inputFile,
        outputFile,
        kind,
        options,
      });

      totalAfter += result.final;
      if (result.compressed) {
        optimizedCount += 1;
      } else {
        copiedCount += 1;
      }

      const savings = result.original - result.final;
      const pct = result.original > 0 ? ((savings / result.original) * 100).toFixed(1) : '0.0';
      const action = result.compressed ? 'optimized' : 'copied';
      console.log(
        `[OK]  ${action.padEnd(9)} ${relative}  ${formatBytes(result.original)} -> ${formatBytes(result.final)}  (${pct}% saved)`
      );
    } catch (error) {
      totalAfter += inputStat.size;
      copiedCount += 1;
      await copyFileWithDirs(inputFile, outputFile);
      console.warn(`[WARN] failed to process ${relative}. Original copied. ${error.message}`);
    }
  }

  const totalSaved = totalBefore - totalAfter;
  const totalPct = totalBefore > 0 ? ((totalSaved / totalBefore) * 100).toFixed(1) : '0.0';

  console.log('');
  console.log('Summary');
  console.log(`- Processed:    ${filesToProcess.length}`);
  console.log(`- Optimized:    ${optimizedCount}`);
  console.log(`- Copied:       ${copiedCount}`);
  console.log(`- Before size:  ${formatBytes(totalBefore)}`);
  console.log(`- After size:   ${formatBytes(totalAfter)}`);
  console.log(`- Total saved:  ${formatBytes(totalSaved)} (${totalPct}%)`);

  if (filesToProcess.length < mediaFiles.length) {
    console.log(`- Skipped by --max-files: ${mediaFiles.length - filesToProcess.length}`);
  }
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
