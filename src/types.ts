export type PackageRow = {
  id: string;
  name: string;
  slug: string;
  version: string;
  description: string;
  author: string;
  homepage_url: string | null;
  tags: string[];
  file_key: string;
  file_url: string;
  file_name: string;
  file_size: number;
  created_at: string;
};

export type PackageDraft = {
  name: string;
  version: string;
  description: string;
  author: string;
  homepageUrl: string;
  tags: string;
  file: File | null;
};

export type AuthIdentity = {
  id?: string;
  email?: string;
};

export type PackageCard = {
  id: string;
  name: string;
  slug: string;
  version: string;
  description: string;
  author: string;
  homepageUrl: string | null;
  tags: string[];
  fileKey: string;
  fileUrl: string;
  fileName: string;
  fileSize: number;
  createdAt: string;
};

export type DigestEntry = {
  id: string;
  name: string;
};
