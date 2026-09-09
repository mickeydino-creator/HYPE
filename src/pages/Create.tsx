import { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import clsx from 'clsx';
import { createTrend, useCategories } from '../lib/hooks';
import { ApiClientError } from '../lib/api';

export default function Create() {
  const navigate = useNavigate();
  const fileRef = useRef<HTMLInputElement>(null);
  const categories = useCategories();

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<string>('');
  const [startingPrice, setStartingPrice] = useState('10');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  function handleFile(file: File) {
    setImageFile(file);
    const reader = new FileReader();
    reader.onload = () => setImagePreview(reader.result as string);
    reader.readAsDataURL(file);
  }

  async function handlePublish() {
    if (!imageFile) return setError('Add an image for your trend');
    if (!name.trim()) return setError('Give your trend a name');
    if (!description.trim()) return setError('Add a short description');
    const price = Number(startingPrice);
    if (!price || price <= 0) return setError('Set a valid starting price');
    const pickedCategory = category || categories[0];
    if (!pickedCategory) return setError('Pick a category');

    setBusy(true);
    setError(null);
    try {
      const res = await createTrend({
        name,
        description,
        category: pickedCategory,
        startingPrice: price,
        image: imageFile,
      });
      navigate(`/trend/${res.trend.id}`);
    } catch (err) {
      setError(err instanceof ApiClientError ? err.message : 'Something went wrong');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto max-w-md px-4 pb-28 pt-4 safe-top">
      <header className="mb-6">
        <h1 className="text-2xl font-extrabold tracking-tight">Create a trend</h1>
        <p className="text-sm text-white/45">Share what you believe is about to blow up.</p>
      </header>

      <input
        ref={fileRef}
        type="file"
        accept="image/png,image/jpeg,image/webp,image/gif"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFile(file);
        }}
      />

      <button
        onClick={() => fileRef.current?.click()}
        className="tap-scale mb-5 flex aspect-[4/3] w-full items-center justify-center overflow-hidden rounded-xl2 border border-dashed border-white/15 bg-white/[0.03]"
      >
        {imagePreview ? (
          <img src={imagePreview} alt="Preview" className="h-full w-full object-cover" />
        ) : (
          <div className="flex flex-col items-center gap-2 text-white/40">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/5 text-2xl">+</div>
            <span className="text-sm font-medium">Upload image</span>
          </div>
        )}
      </button>

      <label className="mb-1 block text-xs font-semibold text-white/50">Trend name</label>
      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="e.g. AI Smart Glasses"
        className="mb-4 w-full rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm outline-none placeholder:text-white/25"
      />

      <label className="mb-1 block text-xs font-semibold text-white/50">Short description</label>
      <textarea
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="Why is this about to take off?"
        rows={3}
        className="mb-4 w-full resize-none rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm outline-none placeholder:text-white/25"
      />

      <label className="mb-1 block text-xs font-semibold text-white/50">Category</label>
      <div className="no-scrollbar mb-4 flex gap-2 overflow-x-auto pb-1">
        {categories.map((c) => (
          <button
            key={c}
            onClick={() => setCategory(c)}
            className={clsx(
              'tap-scale shrink-0 rounded-full border px-4 py-1.5 text-xs font-semibold',
              (category || categories[0]) === c
                ? 'border-white bg-white text-black'
                : 'border-white/10 bg-white/[0.03] text-white/60'
            )}
          >
            {c}
          </button>
        ))}
      </div>

      <label className="mb-1 block text-xs font-semibold text-white/50">Starting HYPE price</label>
      <div className="mb-6 flex items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3">
        <input
          inputMode="decimal"
          value={startingPrice}
          onChange={(e) => setStartingPrice(e.target.value.replace(/[^0-9.]/g, ''))}
          className="w-full bg-transparent text-sm outline-none"
        />
        <span className="text-xs font-semibold text-white/40">HYPE</span>
      </div>

      {error && <p className="mb-4 text-center text-xs font-medium text-accent-down">{error}</p>}

      <button
        onClick={handlePublish}
        disabled={busy}
        className="tap-scale w-full rounded-full bg-white py-3.5 text-sm font-bold text-black disabled:opacity-40"
      >
        {busy ? 'Publishing…' : 'Publish trend'}
      </button>
    </div>
  );
}
