import { useRecordContext } from "react-admin";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const Image = ({ recordEdit, isPending }: { recordEdit?: any; isPending?: boolean }) => {
  const record = useRecordContext();
  const src = record?.src || `data:${recordEdit.imageType};base64,${recordEdit.imageEncoded}`;
  if (isPending) return null;
  return (
    <div style={{ display: 'flex', justifyContent: 'center', maxHeight: '300px', overflow: 'hidden', alignItems: 'center' }}>
      <img src={src} style={{ maxHeight: '300px', width: 'auto', height: 'auto', objectFit: 'contain' }} />
    </div>
  );
};

export default Image;
