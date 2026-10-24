"use client";

import { useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Field, Honeypot } from "@/components/ui/Field";
import { isEmail, lengthError, type Errors } from "@/lib/validate";
import { track } from "@/lib/consent";

export function ContactForm() {
  const [f, setF] = useState({ name: "", email: "", message: "" });
  const [hp, setHp] = useState("");
  const [errors, setErrors] = useState<Errors>({});
  const [state, setState] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [serverErr, setServerErr] = useState("");
  const started = useRef(Date.now());

  const validate = () => {
    const e: Errors = {};
    const n = lengthError("Name", f.name, 2, 80);
    if (n) e.name = n;
    if (!f.email.trim()) e.email = "Email is required.";
    else if (!isEmail(f.email.trim())) e.email = "Enter an email like name@example.com.";
    const m = lengthError("Message", f.message, 10, 2000);
    if (m) e.message = m;
    return e;
  };

  const onSubmit = async (ev: React.FormEvent) => {
    ev.preventDefault();
    const e = validate();
    setErrors(e);
    if (Object.keys(e).length) {
      document.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus();
      return;
    }
    setState("sending");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...f, website: hp, elapsed: Date.now() - started.current }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) throw new Error(data.error ?? "Something went wrong.");
      setState("sent");
      track("contact_sent");
    } catch (err) {
      setServerErr(err instanceof Error ? err.message : "Something went wrong.");
      setState("error");
    }
  };

  const upd = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setF((s) => ({ ...s, [k]: e.target.value }));
    if (errors[k]) setErrors((x) => ({ ...x, [k]: "" }));
  };

  return (
    <AnimatePresence mode="wait">
      {state === "sent" ? (
        <motion.div
          key="sent"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-xl border border-moss bg-moss-soft p-6"
          role="status"
        >
          <h2 className="font-display text-xl font-semibold text-moss">Message received</h2>
          <p className="mt-2 text-ink-2">Thanks, {f.name.split(" ")[0]}. We read every message and reply within a few days.</p>
        </motion.div>
      ) : (
        <motion.form key="form" noValidate onSubmit={onSubmit} className="relative space-y-5 rounded-xl border border-line bg-card p-5 sm:p-7" exit={{ opacity: 0 }}>
          <Honeypot value={hp} onChange={setHp} />
          <Field label="Your name" error={errors.name}>
            {(p) => <input {...p} className="field" autoComplete="name" value={f.name} maxLength={80} onChange={upd("name")} />}
          </Field>
          <Field label="Email" error={errors.email}>
            {(p) => <input {...p} type="email" className="field" autoComplete="email" value={f.email} maxLength={120} onChange={upd("email")} />}
          </Field>
          <Field label="Message" error={errors.message} hint={`${f.message.length}/2000`}>
            {(p) => <textarea {...p} rows={5} className="field resize-y" value={f.message} maxLength={2000} onChange={upd("message")} />}
          </Field>
          {state === "error" && (
            <p role="alert" className="text-sm text-clay">
              {serverErr}
            </p>
          )}
          <button className="btn btn-primary" disabled={state === "sending"}>
            {state === "sending" ? "Sending" : "Send message"}
          </button>
        </motion.form>
      )}
    </AnimatePresence>
  );
}
