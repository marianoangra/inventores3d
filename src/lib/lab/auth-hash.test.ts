import { expect, test } from "vitest";
import { parseAuthHash } from "./auth-hash";

test("link do e-mail com tokens no #", () => {
  expect(parseAuthHash("#access_token=aaa&expires_in=3600&refresh_token=bbb&token_type=bearer&type=magiclink")).toEqual({ accessToken: "aaa", refreshToken: "bbb" });
});

test("link vencido devolve o motivo", () => {
  expect(parseAuthHash("#error=access_denied&error_code=otp_expired&error_description=Email+link+is+invalid+or+has+expired")).toEqual({ error: "otp_expired" });
});

test("sem nada no # é erro genérico", () => expect(parseAuthHash("")).toEqual({ error: "sem_token" }));
test("só access_token sem refresh é erro", () => expect(parseAuthHash("#access_token=aaa")).toEqual({ error: "sem_token" }));
