// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const transform = async (data: any) => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { kind, createdAt, updatedAt, imageEncoded, ...rest } = data;

  const transformedData = { ...rest };

  return new Promise((resolve, reject) => {
    if (!imageEncoded?.rawFile) {
      resolve({ ...transformedData, imageEncoded });
    }

    const reader = new FileReader();
    reader.onload = () => {
      // Grab only the base64 encoded file contents, splitting off the data uri
      transformedData.imageEncoded = reader.result?.toString().split(',')[1];
      transformedData.imageType = imageEncoded.rawFile.type;
      resolve(transformedData);
    };
    reader.onerror = reject;
    reader.readAsDataURL(imageEncoded.rawFile);
  });
};
