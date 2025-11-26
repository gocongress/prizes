import { useRecordContext } from "react-admin";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const ImageThumbnail = () => {
  const record = useRecordContext();
  if (!record?.imageThumbnailEncoded) {
    return null;
  }
  const src = `data:${record.imageType};base64,${record.imageThumbnailEncoded}`;
  return (
    <div style={{ display: 'flex', justifyContent: 'center', maxHeight: '100px', overflow: 'hidden', alignItems: 'center' }}>
      <img src={src} style={{ maxHeight: '100px', width: 'auto', height: 'auto', objectFit: 'contain' }} />
    </div>
  );
};

export default ImageThumbnail;
