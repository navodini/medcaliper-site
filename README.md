# medCaliper website

Static website for [www.medcaliper.co.uk](https://www.medcaliper.co.uk/), published from the repository through GitHub Pages.

## Local preview

Run a local server from this directory:

```bash
python3 -m http.server 8765
```

Then open <http://127.0.0.1:8765/>.

## Site structure

- `index.html` - homepage content and semantic structure
- `styles.css` - responsive visual system and motion
- `main.js` - navigation, reveal effects, active sections and privacy controls
- `analytics.js` - consent-aware Google Analytics integration and engagement events
- `privacy.html` - privacy and analytics notice
- `hero-brain.webp` and `theo-photo.webp` - optimised web derivatives of the source images
- `fonts/` - self-hosted Public Sans and Urbanist template font weights

## Activate analytics

Analytics is connected to Google Analytics 4 and remains blocked until a visitor accepts optional analytics.

1. Create or select a GA4 web data stream for `https://www.medcaliper.co.uk/`.
2. Open `analytics.js`.
3. The configured stream Measurement ID is stored in `analytics.js`.
4. Confirm the GA4 retention and data-sharing settings.
5. Update the cookie duration and provider details in `privacy.html` if they differ from the notice.
6. Test consent acceptance, rejection and withdrawal before publishing.

The Google tag is not requested before consent. Tracking does not intentionally send names, email addresses, feedback form responses, URL query strings or a medCaliper user ID.

### Events

After consent, the site records:

- `page_view`
- `section_view`
- `navigation_click`
- `cta_click`
- `feedback_click`
- `contact_click`
- `partner_click`
- `faq_open`
- `video_start`
- `video_pause`
- `video_resume`
- `video_progress`
- `video_complete`

The public site has no user accounts. Analytics describes pseudonymous browser sessions and aggregate behaviour; it does not identify a named visitor.

## Publishing checklist

- Check the homepage at desktop and mobile widths.
- Confirm both feedback forms and the email links.
- Confirm video playback.
- Review medical/product wording with the team.
- Review `privacy.html` whenever tracking or providers change.
- Verify the live page after GitHub Pages finishes deploying.
