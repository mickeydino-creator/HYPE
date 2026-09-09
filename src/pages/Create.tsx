import { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import clsx from 'clsx';
import { useStore } from '../lib/store';
import type { Category } from '../types';

const CATEGORIES: Category[] = [
  'Tech',
  'Fashion',
  'Music',
  'Gaming',
  'Lifestyle',
  'Food',
  'Sports',
  'Art',
  'Finance-Meme',
  'Other',
];

export default function Create() {
  const { createTrend } = useStore();
  const navigate = useNavigate();
  const fileRef = useRef<HTMLInputElement>(null);

  const [image, setImage] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<Category>('Tech');
  const [startingPrice, setStartingPrice] = useState('10');
  const [error, setError] = useState<string | null>(null);

  function handleFile(file: File) {
    const reader = new FileReader();
    reader.onload = () => setImage(reader.result as string);
    reader.readAsDataURL(file);
  }

  function handlePublish() {
    if (!image) return setError('Add an image for your trend');
    if (!name.trim()) return setError('Give your trend a name');
    if (!description.trim()) return setError('Add a short description');
    const price = Number(startingPrice);
    if (!price || price <= 0) return setError('Set a valid starting price');

    const id = createTrend({ name, description, category, image, startingPrice: price });
    navigate(`/trend/${id}`);
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
        accept="image/*"
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
        {image ? (
          <img src={image} alt="Preview" className="h-full w-full object-cover" />
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
        {CATEGORIES.map((c) => (
          <button
            key={c}
            onClick={() => setCategory(c)}
            className={clsx(
              'tap-scale shrink-0 rounded-full border px-4 py-1.5 text-xs font-semibold',
              category === c ? 'border-white bg-white text-black' : 'border-white/10 bg-white/[0.03] text-white/60'
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
        className="tap-scale w-full rounded-full bg-white py-3.5 text-sm font-bold text-black"
      >
        Publish trend
      </button>
    </div>
  );
}
