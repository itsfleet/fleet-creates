import { Sora } from 'next/font/google';
import './globals.css';
import Providers from '../components/Providers';
import Nav from '../components/Nav';
const sora = Sora({ subsets: ['latin'] });
export const metadata = { title: 'FLEET CREATES — YouTube Thumbnail Design', description: 'Professional custom YouTube thumbnails.' };
export default function RootLayout({ children }) {
  return (<html lang="en"><body className={sora.className}><Providers><Nav />{children}</Providers></body></html>);
}
