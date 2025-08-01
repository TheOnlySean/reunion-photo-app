import { Suspense } from 'react';
import { MobileDownloadPage } from '@/components/MobileDownloadPage';

interface MobileDownloadPageProps {
  searchParams: {
    photo?: string;
  };
}

export default function MobileDownload({ searchParams }: MobileDownloadPageProps) {
  const photoUrl = searchParams.photo;

  if (!photoUrl) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-400 via-pink-500 to-red-500 flex items-center justify-center">
        <div className="text-center text-white">
          <h1 className="text-2xl font-bold mb-2">写真が見つかりません</h1>
          <p>QRコードから再度アクセスしてください</p>
        </div>
      </div>
    );
  }

  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-purple-400 via-pink-500 to-red-500 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
      </div>
    }>
      <MobileDownloadPage 
        photoUrl={decodeURIComponent(photoUrl)}
        sessionInfo={{
          session_name: 'パーティー写真',
          created_at: new Date().toISOString(),
          download_count: 0
        }}
      />
    </Suspense>
  );
}

export const metadata = {
  title: '写真を保存 - パーティー記念写真',
  description: 'パーティーの記念写真を保存またはシェアしてください',
  robots: {
    index: false,
    follow: false,
  },
};