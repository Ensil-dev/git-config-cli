#!/usr/bin/env node
import { Command } from "commander";
import chalk from "chalk";
import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
import open from "open";
import { resolve } from "path";
dotenv.config({ path: resolve(process.cwd(), ".env") });
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
if (!supabaseUrl || !supabaseKey) {
  throw new Error("Supabase 환경 변수가 설정되지 않았습니다.");
}
const supabase = createClient(supabaseUrl, supabaseKey);
const program = new Command();
async function handleGitHubAuth() {
  try {
    console.log(chalk.blue("GitHub 계정으로 로그인을 시작합니다..."));
    const { data: authData, error: authError } = await supabase.auth.signInWithOAuth({
      provider: "github",
      options: {
        skipBrowserRedirect: true,
        scopes: "read:user user:email"
      }
    });
    if (authError) {
      console.error(chalk.red("GitHub 인증 초기화 오류:"), authError.message);
      return false;
    }
    if (!authData.url) {
      console.error(chalk.red("인증 URL을 받지 못했습니다."));
      return false;
    }
    console.log(
      chalk.blue("아래 링크를 브라우저에서 열어 GitHub 로그인을 완료해주세요:")
    );
    console.log(chalk.green(authData.url));
    await open(authData.url);
    console.log(chalk.yellow("GitHub에서 인증이 완료될 때까지 기다리는 중..."));
    const maxAttempts = 60;
    const intervalMs = 1e3;
    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      if (sessionError) {
        console.error(chalk.red("세션 확인 오류:"), sessionError.message);
        return false;
      }
      if (sessionData.session) {
        console.log(chalk.green("GitHub 로그인 성공!"));
        console.log(
          chalk.blue("사용자 이메일:"),
          sessionData.session.user.email
        );
        return true;
      }
      await new Promise((resolve2) => setTimeout(resolve2, intervalMs));
      if (attempt % 5 === 0) {
        process.stdout.write(".");
      }
    }
    console.log("\n");
    console.log(chalk.red("인증 시간이 초과되었습니다. 다시 시도해주세요."));
    return false;
  } catch (error) {
    console.error(chalk.red("예상치 못한 오류:"), error);
    return false;
  }
}
async function main() {
  program.name("git-config-cli").description("GitHub 설정을 관리하는 CLI 도구").version("0.0.1");
  program.command("login").description("GitHub 계정으로 로그인합니다").action(async () => {
    try {
      const success = await handleGitHubAuth();
      if (!success) {
        console.log(chalk.red("로그인에 실패했습니다."));
        process.exit(1);
      }
    } catch (error) {
      console.error(chalk.red("오류 발생:"), error);
      process.exit(1);
    }
  });
  program.parse();
}
main().catch((error) => {
  console.error(chalk.red("프로그램 실행 중 오류 발생:"), error);
  process.exit(1);
});
