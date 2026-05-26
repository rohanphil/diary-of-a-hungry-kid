"use client";

import { useRef, useState, useCallback } from "react";
import { Camera, Upload, X, ImagePlus } from "lucide-react";

interface PhotoUploadProps {
  photos: string[];
  onChange: (photos: string[]) => void;
  disabled?: boolean;
}

export default function PhotoUpload({ photos, onChange, disabled }: PhotoUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);

  const addPhotos = useCallback(
    (files: FileList | null) => {
      if (!files) return;
      const fileArr = Array.from(files).filter((f) => f.type.startsWith("image/"));
      fileArr.forEach((file) => {
        const reader = new FileReader();
        reader.onload = (e) => {
          const dataUrl = e.target?.result as string;
          onChange([...photos, dataUrl]);
        };
        reader.readAsDataURL(file);
      });
    },
    [photos, onChange]
  );

  const removePhoto = (index: number) => {
    onChange(photos.filter((_, i) => i !== index));
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    addPhotos(e.dataTransfer.files);
  };

  return (
    <div className="space-y-3">
      {/* Upload zone */}
      <div
        onDrop={handleDrop}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onClick={() => !disabled && fileInputRef.current?.click()}
        className={`
          relative border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all
          ${dragOver ? "border-orange-400 bg-orange-50 scale-[1.01]" : "border-gray-200 hover:border-orange-300 hover:bg-orange-50/50"}
          ${disabled ? "opacity-50 cursor-not-allowed" : ""}
        `}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(e) => addPhotos(e.target.files)}
          disabled={disabled}
        />
        <div className="flex flex-col items-center gap-3">
          <div className="p-3 bg-orange-100 rounded-full">
            <ImagePlus className="w-7 h-7 text-orange-500" />
          </div>
          <div>
            <p className="font-semibold text-gray-700">Drop photos here or click to upload</p>
            <p className="text-sm text-gray-400 mt-1">PNG, JPG, HEIC — multiple photos supported</p>
          </div>
          <div className="flex gap-2 mt-1">
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }}
              className="flex items-center gap-1.5 px-4 py-2 bg-orange-500 text-white text-sm font-medium rounded-xl hover:bg-orange-600 transition-colors"
              disabled={disabled}
            >
              <Upload className="w-4 h-4" /> Choose Files
            </button>
          </div>
        </div>
      </div>

      {/* Photo thumbnails */}
      {photos.length > 0 && (
        <div className="grid grid-cols-3 gap-2">
          {photos.map((photo, index) => (
            <div key={index} className="relative group aspect-square rounded-xl overflow-hidden bg-gray-100">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={photo}
                alt={`Food photo ${index + 1}`}
                className="w-full h-full object-cover"
              />
              {!disabled && (
                <button
                  onClick={() => removePhoto(index)}
                  className="absolute top-1 right-1 p-1 bg-black/60 rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
              {index === 0 && (
                <span className="absolute bottom-1 left-1 text-xs bg-black/50 text-white px-1.5 py-0.5 rounded-md">
                  Main
                </span>
              )}
            </div>
          ))}
          {!disabled && (
            <button
              onClick={() => fileInputRef.current?.click()}
              className="aspect-square rounded-xl border-2 border-dashed border-gray-200 flex items-center justify-center text-gray-400 hover:border-orange-300 hover:text-orange-400 transition-colors"
            >
              <Camera className="w-6 h-6" />
            </button>
          )}
        </div>
      )}
    </div>
  );
}
