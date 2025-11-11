import type { JSX } from "react";
import { FaceDetectionTest } from "@/features/try-on/components/FaceDetectionTest";

export default function TryOnPage(): JSX.Element {
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Thử Kính Online</h1>
      <p className="text-muted-foreground mb-8">
        Upload ảnh của bạn để thử các mẫu kính
      </p>
      {/* Test component for face detection */}
      <FaceDetectionTest />
    </div>
  );
}

