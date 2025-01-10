import { AxiosResponse } from 'axios';
import { axiosInstance } from './authService';
import { API_URL } from '../config/config';

export interface DownloadOptions {
  onProgress?: (progress: number) => void;
  filename?: string;
}

class PdfService {
  private static instance: PdfService;

  private constructor() {}

  public static getInstance(): PdfService {
    if (!PdfService.instance) {
      PdfService.instance = new PdfService();
    }
    return PdfService.instance;
  }

  private getAuthHeader(): { Authorization: string } {
    const token = localStorage.getItem('token');
    return { Authorization: `Bearer ${token}` };
  }

  public async downloadPdf(url: string, options: DownloadOptions = {}): Promise<void> {
    try {
      const response = await axiosInstance.get(`${API_URL}/api/admin/proxy-pdf`, {
        params: { url },
        responseType: 'blob',
        headers: {
          ...this.getAuthHeader(),
          'Accept': 'application/pdf'
        },
        onDownloadProgress: (progressEvent) => {
          if (options.onProgress && progressEvent.total) {
            const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            options.onProgress(progress);
          }
        }
      });

      if (response.status !== 200) {
        throw new Error('PDF indirme başarısız');
      }

      const blob = new Blob([response.data], { type: 'application/pdf' });
      const downloadUrl = window.URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = options.filename || 'document.pdf';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);
    } catch (error: any) {
      console.error('PDF download error:', error);
      throw new Error(error.response?.data?.message || 'PDF indirme işlemi başarısız oldu');
    }
  }

  public async downloadSummary(summaryUrl: string, title: string): Promise<void> {
    return this.downloadPdf(summaryUrl, {
      filename: `${title}_özet.pdf`,
      onProgress: (progress) => {
        console.log(`İndirme ilerlemesi: ${progress}%`);
      }
    });
  }

  public async downloadOriginal(fileUrl: string, title: string): Promise<void> {
    return this.downloadPdf(fileUrl, {
      filename: `${title}.pdf`,
      onProgress: (progress) => {
        console.log(`İndirme ilerlemesi: ${progress}%`);
      }
    });
  }
}

export default PdfService; 