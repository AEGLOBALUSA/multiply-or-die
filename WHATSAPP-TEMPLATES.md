# WhatsApp Templates for Wati — Multiply or Die

## Flow Design

**Session messages (no template needed):** Messages sent immediately after user interaction (within 24h window). These use free-form text via Wati's session message API.

| Trigger | Message Type | When |
|---------|-------------|------|
| User registers at event | `registration_welcome` | Immediate |
| User completes profile (4+ fields) | `masterclass_unlock` | Immediate |
| User submits Video 4 assignment (100+ church) | `masterclass_complete_100plus` | Immediate |
| User submits Video 4 assignment (<100 church) | `masterclass_complete_under100` | Immediate |

**Template messages (Meta approval required):** Messages sent days/weeks later via cron, outside the 24h session window.

---

## Template 1: profile_nudge

- **Category:** UTILITY
- **Language:** id (Bahasa Indonesia)
- **Body:**

```
Halo {{1}}! Sudah mulai membaca? Lengkapi profil kepemimpinan Anda untuk membuka akses ke masterclass video gratis. {{2}}
```

- **Variables:**
  - `{{1}}` = first_name
  - `{{2}}` = profile page link
- **Used by:** Day 7 profile nudge (`day_7_profile_nudge`)

---

## Template 2: profile_nudge_urgent

- **Category:** UTILITY
- **Language:** id (Bahasa Indonesia)
- **Body:**

```
Halo {{1}}, masterclass Anda menunggu! 4 video yang akan mengubah cara Anda memimpin. Selesaikan profil Anda sekarang: {{2}}
```

- **Variables:**
  - `{{1}}` = first_name
  - `{{2}}` = profile page link
- **Used by:** Day 14 profile nudge (`day_14_profile_nudge`)

---

## Template 3: video_unlock

- **Category:** UTILITY
- **Language:** id (Bahasa Indonesia)
- **Body:**

```
{{1}} telah dibuka! Lanjutkan perjalanan kepemimpinan Anda: {{2}}
```

- **Variables:**
  - `{{1}}` = video title (e.g., "Video 2", "Video 3", "Video terakhir")
  - `{{2}}` = masterclass page link
- **Used by:** Video 2/3/4 unlock notifications (`video_2_unlock`, `video_3_unlock`, `video_4_unlock`)

---

## Template 4: monthly_checkin

- **Category:** UTILITY
- **Language:** id (Bahasa Indonesia)
- **Body:**

```
Halo {{1}}! Pertanyaan bulan ini: {{2}}
```

- **Variables:**
  - `{{1}}` = first_name
  - `{{2}}` = check-in question text
- **Used by:** Monthly check-ins for under-100 pastors (`monthly_checkin_1` through `monthly_checkin_4`)

---

## Submission Instructions

1. Log into Wati dashboard
2. Go to Template Messages > Create Template
3. For each template above:
   - Enter the template name exactly as shown
   - Select category: UTILITY
   - Select language: Indonesian (id)
   - Enter body text with `{{1}}`, `{{2}}` placeholders
   - Submit for approval
4. Allow 2-3 business days for Meta review
5. Once approved, the cron job will automatically use these templates
