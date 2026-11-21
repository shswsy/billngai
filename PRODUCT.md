# Product

<!-- impeccable:product-schema 1 -->

Shared studio rules (audiences, positioning, Thai-first, honesty, layout and font preferences) live in `../PRODUCT.md` (`E:\fastwork\PRODUCT.md`). Read it too. This file adds only what is specific to บิลง่าย.

## Platform

web

## Users

Thai freelancers and small shop owners who need a quotation, invoice or receipt fast. They are not accountants, and they often work on a phone. A Fastwork buyer evaluating the studio is the secondary audience.

## Product Purpose

บิลง่าย (billngai) is a free Thai quotation, invoice and receipt generator. A user fills in a document, sees an A4 preview, and prints it or saves it as a PDF. Success means a correct, professional-looking Thai document in a few minutes, with no sign-up.

## Operating Context

- Live at https://shswsy.github.io/billngai/. `?demo` loads sample data only when nothing is saved yet.
- Output is browser print of `.paper` (A4, Sarabun).

## Capabilities and Constraints

- Static React 19, TypeScript and Vite. No backend. All data lives in the browser's localStorage (`billngai:*` keys), so nothing leaves the user's device.
- Prints baht amounts in Thai words, makes a PromptPay QR code, and calculates totals (all covered by tests).
- Portfolio piece #1. Keep the demo safe: it never overwrites saved user data.
