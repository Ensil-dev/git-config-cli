import express from 'express';
import dotenv from 'dotenv';

// 기본적으로 프로젝트 루트의 .env 파일을 로드
dotenv.config();

console.log(process.env)

// 환경 변수 로드
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Supabase 환경 변수가 설정되지 않았습니다.');
}

// Express 서버 초기화
const app = express();
const PORT = 3000;

// 서버 시작
app.listen(PORT, () => {
  console.log(`OAuth Redirect Server is running at http://localhost:${PORT}`);
});
