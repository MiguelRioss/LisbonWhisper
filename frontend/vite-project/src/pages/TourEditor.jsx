import { useState } from 'react';
import { Button, Field, Modal } from '../database-generic/index.js';
import { tourBookingInfo } from '../services/bookingService';
import { saveTour } from '../services/databaseService';

const images = [
  { label: 'Moorish Whispers', url: '/res/f03ef0dcb35a8e63d746cfa4741a4f96.jpg' },
  { label: 'West Whispers', url: '/res/9bfee964e2a50ec45dc449890ec9ed42.jpg' },
  { label: 'Lisbon city view', url: '/res/pexels-hillaryfox-1615815.jpg' },
  { label: 'Lisbon panorama', url: '/res/pexels-pixabay-461936.jpg' },
  { label: 'Lisbon street', url: '/res/pexels-fotios-photos-1599497.jpg' },
];
const videos = [
  { label: 'Moorish Whispers', url: '/res/Free_videoLisbon_AI_GENERATED.mp4' },
  { label: 'West Whispers', url: '/res/LisbonDownTown.mp4' },
];

function MediaPicker({ label, value, onChange, saving, video = false }) {
  const library = video ? videos : images;
  const selection = library.some(({ url }) => url === value) ? value : 'custom';
  return (
    <div className="lisbon-media-picker">
      <Field
        label={label}
        options={[...library.map(({ label, url }) => ({ label, value: url })), { label: 'Use a media link', value: 'custom' }]}
        value={selection}
        onChange={(event) => onChange(event.target.value === 'custom' ? '' : event.target.value)}
        disabled={saving}
        required
      />
      {selection === 'custom' && (
        <Field label={`${label} link`} value={value} onChange={(event) => onChange(event.target.value)} placeholder="https://…" required disabled={saving} />
      )}
      {value && (video
        ? <video src={value} controls preload="none" playsInline aria-label={`${label} preview`} />
        : <img src={value} alt={`${label} preview`} />)}
    </div>
  );
}

function MediaFields({ media, setMedia, saving }) {
  function change(field, value) {
    setMedia((current) => ({ ...current, [field]: value }));
  }

  function moveImage(index, step) {
    const reordered = [...media.carouselImages];
    [reordered[index], reordered[index + step]] = [reordered[index + step], reordered[index]];
    change('carouselImages', reordered);
  }

  return (
    <>
      <MediaPicker label="Home page video" video value={media.videoSrc} onChange={(url) => change('videoSrc', url)} saving={saving} />
      <MediaPicker label="Main image" value={media.image} onChange={(url) => change('image', url)} saving={saving} />
      <MediaPicker label="Check Availability image" value={media.availabilityImage} onChange={(url) => change('availabilityImage', url)} saving={saving} />
      <fieldset className="lisbon-tour-carousel">
        <legend>Carousel images</legend>
        {media.carouselImages.map((url, index) => (
          <div className="lisbon-carousel-image" key={index}>
            <MediaPicker
              label={`Image ${index + 1}`}
              value={url}
              onChange={(next) => change('carouselImages', media.carouselImages.map((image, i) => i === index ? next : image))}
              saving={saving}
            />
            <div className="db-actions">
              <Button onClick={() => moveImage(index, -1)} disabled={saving || index === 0}>Move up</Button>
              <Button onClick={() => moveImage(index, 1)} disabled={saving || index === media.carouselImages.length - 1}>Move down</Button>
              <Button onClick={() => change('carouselImages', media.carouselImages.filter((_, i) => i !== index))} disabled={saving || media.carouselImages.length === 1}>Remove</Button>
            </div>
          </div>
        ))}
        <Button onClick={() => change('carouselImages', [...media.carouselImages, images[0].url])} disabled={saving || media.carouselImages.length >= 10}>Add image</Button>
      </fieldset>
    </>
  );
}

function DetailsFields({ tour, saving }) {
  return (
    <>
      <Field label="Tour name" name="title" defaultValue={tour.title} maxLength={120} required disabled={saving} />
      <Field label="Tour label" name="tag" defaultValue={tour.tag} maxLength={40} required disabled={saving} />
      <div className="db-field">
        <label htmlFor="tour-short-description">Short description</label>
        <textarea id="tour-short-description" name="description" defaultValue={tour.description} maxLength={300} rows={2} required disabled={saving} />
      </div>
      <div className="db-field">
        <label htmlFor="tour-additional-details">Full tour details</label>
        <textarea id="tour-additional-details" name="additionalDetails" defaultValue={(tour.descriptions || []).slice(1).join('\n\n')} rows={5} aria-describedby="tour-paragraph-hint" disabled={saving} />
        <small id="tour-paragraph-hint" className="db-muted">Separate paragraphs with a blank line.</small>
      </div>
      <Field label="Starting point" name="startingPoint" defaultValue={tour.startingPoint ?? tourBookingInfo.startingPoint} maxLength={200} required disabled={saving} />
      <Field label="Price per person (€)" name="price" type="number" min={1} max={10000} step={0.01} defaultValue={(tour.priceCents ?? tourBookingInfo.priceCents) / 100} required disabled={saving} />
      <Field label="Maximum group size" name="maxPersons" type="number" min={1} max={20} step={1} defaultValue={tour.maxPersons ?? tourBookingInfo.maxPersons} required disabled={saving} />
    </>
  );
}

export default function TourEditor({ tour, mode, token, onClose, onSaved }) {
  const editingMedia = mode === 'media';
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [media, setMedia] = useState(() => ({
    videoSrc: tour.videoSrc || videos[0].url,
    image: tour.image || tour.backgroundImage || images[0].url,
    availabilityImage: tour.availabilityImage || images[4].url,
    carouselImages: tour.carouselImages?.length ? tour.carouselImages : images.slice(2).map(({ url }) => url),
  }));

  async function handleSubmit(event) {
    event.preventDefault();
    if (saving) return;
    const fields = new FormData(event.currentTarget);
    const changes = editingMedia ? media : {
      title: fields.get('title'),
      tag: fields.get('tag'),
      description: fields.get('description'),
      additionalDetails: String(fields.get('additionalDetails')).split(/\r?\n\s*\r?\n/).map((text) => text.trim()).filter(Boolean),
      startingPoint: fields.get('startingPoint'),
      priceCents: Math.round(Number(fields.get('price')) * 100),
      maxPersons: Number(fields.get('maxPersons')),
    };
    setSaving(true);
    setError('');
    try {
      await saveTour(token, tour.slug, changes, { media: editingMedia });
      onSaved(tour.slug, editingMedia ? 'Tour media saved.' : 'Tour details saved.');
    } catch (err) {
      setError(err.message);
      setSaving(false);
    }
  }

  return (
    <Modal open className="lisbon-tour-editor" title={`${editingMedia ? 'Media Content' : 'Edit tour'} · ${tour.title}`} onClose={() => { if (!saving) onClose(); }}>
      <form className="lisbon-tour-media-form" onSubmit={handleSubmit}>
        {editingMedia
          ? <MediaFields media={media} setMedia={setMedia} saving={saving} />
          : <DetailsFields tour={tour} saving={saving} />}
        {error && <p role="alert">{error}</p>}
        <Button type="submit" variant="primary" disabled={saving}>{saving ? 'Saving…' : 'Save changes'}</Button>
      </form>
    </Modal>
  );
}
