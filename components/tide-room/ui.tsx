"use client";
import * as React from "react";
import { Dialog as D } from "@base-ui/react/dialog";
import { AlertDialog as A } from "@base-ui/react/alert-dialog";
export function Button({
  variant,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: string }) {
  void variant;
  return <button type="button" {...props} className={`tr-button ${props.className || ""}`} />;
}
export const Dialog = D.Root;
export const DialogTitle = D.Title;
export const DialogDescription = D.Description;
export function DialogContent({
  children,
  className = "",
  ...props
}: React.ComponentProps<typeof D.Popup>) {
  return (
    <D.Portal>
      <D.Backdrop className="tide-overlay" />
      <D.Popup {...props} className={`tide-popup ${className}`}>
        {children}
        <D.Close className="tide-close" aria-label="닫기">
          ×
        </D.Close>
      </D.Popup>
    </D.Portal>
  );
}
export const AlertDialog = A.Root;
export const AlertDialogTitle = A.Title;
export const AlertDialogDescription = A.Description;
export function AlertDialogContent({
  children,
  className = "",
  ...props
}: React.ComponentProps<typeof A.Popup>) {
  return (
    <A.Portal>
      <A.Backdrop className="tide-overlay" />
      <A.Popup {...props} className={`tide-popup ${className}`}>
        {children}
      </A.Popup>
    </A.Portal>
  );
}
export function AlertDialogFooter(props: React.HTMLAttributes<HTMLDivElement>) {
  return <div {...props} className="tide-row" />;
}
export const AlertDialogCancel = A.Close;
export const AlertDialogAction = A.Close;
export function Slider({
  value,
  onValueChange,
  ...props
}: Omit<React.InputHTMLAttributes<HTMLInputElement>, "value" | "onChange"> & {
  value: number[];
  onValueChange: (v: number[]) => void;
}) {
  return (
    <input
      {...props}
      type="range"
      data-slot="slider"
      value={value[0]}
      onChange={(e) => onValueChange([Number(e.target.value)])}
    />
  );
}
