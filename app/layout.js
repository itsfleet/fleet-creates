import { Sora } from 'next/font/google';
import './globals.css';
import Providers from '../components/Providers';
import Nav from '../components/Nav';
const sora = Sora({ subsets: ['latin'] });
export const metadata = { title: '𝐅𝐥𝐞𝐞𝐭 𝐂𝐫𝐞𝐚𝐭𝐞𝐬', description: 'Professional custom YouTube thumbnails.' };
export default function RootLayout({ children }) {
  return (<html lang="en"><body className={sora.className}><Providers><Nav />{children}</Providers></body></html>);
}
