import { ChangeEvent } from 'react';

interface BottleImageProps {
  imageUrl?: string;
  name: string;
  producer: string;
  vintage: number;
  editable?: boolean;
  onImageChange?: (imageUrl: string) => void;
}

function PlaceholderLabel({ name, producer, vintage }: Pick<BottleImageProps, 'name' | 'producer' | 'vintage'>) {
  return (
    <div className="flex h-full w-full items-center justify-center bg-gradient-to-b from-porcelain via-white to-fog p-3">
      <div className="bottle-placeholder-bottle relative h-40 w-16 rounded-b-md rounded-t-full bg-gradient-to-b from-[#35292D] to-vine shadow-cellar">
        <div className="absolute left-1/2 top-1 h-8 w-6 -translate-x-1/2 rounded-t-md bg-[#2B2226]" />
        <div className="absolute inset-x-2 bottom-6 rounded-sm bg-porcelain px-1 py-3 text-center shadow-subtle">
          <div className="font-serif text-[10px] font-bold uppercase leading-tight text-vine">{producer || 'Cellar'}</div>
          <div className="mt-1 h-px bg-gold" />
          <div className="mt-1 line-clamp-3 text-[10px] font-semibold leading-tight text-ink">{name || 'New wine'}</div>
          <div className="mt-1 text-[10px] font-bold text-moss">{vintage || 'NV'}</div>
        </div>
      </div>
    </div>
  );
}

export default function BottleImage({
  imageUrl,
  name,
  producer,
  vintage,
  editable = false,
  onImageChange,
}: BottleImageProps) {
  const handleUpload = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !onImageChange) return;

    const reader = new FileReader();
    reader.onload = () => {
      onImageChange(String(reader.result));
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="bottle-image-shell overflow-hidden rounded-lg border border-ink/10 bg-white shadow-sm">
      <div className="aspect-[4/5]">
        {imageUrl ? (
          <img className="h-full w-full object-cover transition duration-500 ease-out hover:scale-[1.03]" src={imageUrl} alt={`${producer} ${name} ${vintage} bottle label`} />
        ) : (
          <PlaceholderLabel name={name} producer={producer} vintage={vintage} />
        )}
      </div>
      {editable ? (
        <label className="block cursor-pointer border-t border-ink/10 bg-porcelain px-3 py-2 text-center text-xs font-bold text-vine transition hover:bg-linen">
          Add / replace photo
          <input className="sr-only" type="file" accept="image/*" onChange={handleUpload} />
        </label>
      ) : null}
    </div>
  );
}
