import { notFound } from 'next/navigation';
import { Database } from '@/lib/database';
import { DownloadPage } from '@/components/DownloadPage';

interface PhotoPageProps {
  params: {
    id: string;
  };
}

export default async function PhotoPage({ params }: PhotoPageProps) {
  const sessionId = params.id;

  try {
    // Get session data
    const session = await Database.getSession(sessionId);
    
    if (!session || !session.selected_photo_url) {
      notFound();
    }

    // Increment download count (server-side)
    await Database.incrementDownloadCount(sessionId);

    const sessionInfo = {
      session_name: session.session_name,
      created_at: session.created_at,
      download_count: session.download_count + 1, // +1 for current download
    };

    return (
      <DownloadPage
        photoUrl={session.selected_photo_url}
        sessionInfo={sessionInfo}
      />
    );
  } catch (error) {
    console.error('Error loading photo page:', error);
    notFound();
  }
}

export async function generateMetadata({ params }: PhotoPageProps) {
  const sessionId = params.id;
  
  try {
    const session = await Database.getSession(sessionId);
    
    if (!session) {
      return {
        title: '照片未找到',
      };
    }

    return {
      title: `聚会照片 - ${session.session_name}`,
      description: '来自聚会的美好回忆，点击下载保存到您的设备',
      openGraph: {
        title: `聚会照片 - ${session.session_name}`,
        description: '来自聚会的美好回忆',
        type: 'website',
        images: session.selected_photo_url ? [
          {
            url: session.selected_photo_url,
            width: 1200,
            height: 900,
            alt: '聚会照片',
          },
        ] : [],
      },
      twitter: {
        card: 'summary_large_image',
        title: `聚会照片 - ${session.session_name}`,
        description: '来自聚会的美好回忆',
        images: session.selected_photo_url ? [session.selected_photo_url] : [],
      },
      robots: {
        index: false,
        follow: false,
      },
    };
  } catch (error) {
    return {
      title: '照片加载中...',
    };
  }
}