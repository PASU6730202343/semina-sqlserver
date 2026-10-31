import { redirect } from 'next/navigation';

// รวมหน้าเพิ่มสินค้าเข้ากับระบบตรวจเกรดข้าวด้วย AI เป็นทางเดียวแล้ว
export default function AddProductRedirect() {
  redirect('/ai-grading');
}
