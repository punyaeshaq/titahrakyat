import { useState, useRef } from "react";
import { uploadApi } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Upload, X, Loader2 } from "lucide-react";

interface ImageUploadProps {
  value: string;
  onChange: (url: string) => void;
}

const ImageUpload = ({ value, onChange }: ImageUploadProps) => {
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);

    try {
      const result = await uploadApi.uploadImage(file);
      onChange(result.url);
    } catch (error: any) {
      alert("Upload gagal: " + (error.response?.data?.message || error.message));
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-2">
      {value && (
        <div className="relative inline-block">
          <img src={value} alt="Preview" className="w-full max-w-xs h-32 object-cover rounded-md border border-border" />
          <button
            onClick={() => onChange("")}
            className="absolute top-1 right-1 bg-destructive text-destructive-foreground rounded-full p-0.5"
          >
            <X size={14} />
          </button>
        </div>
      )}
      <div>
        <input ref={fileRef} type="file" accept="image/*" onChange={handleUpload} className="hidden" />
        <Button type="button" variant="outline" size="sm" onClick={() => fileRef.current?.click()} disabled={uploading}>
          {uploading ? <><Loader2 size={14} className="animate-spin" /> Mengupload...</> : <><Upload size={14} /> Upload Gambar</>}
        </Button>
      </div>
    </div>
  );
};

export default ImageUpload;
