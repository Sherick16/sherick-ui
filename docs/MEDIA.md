# Media

`Media` is the visual boundary for images and native video. Import it from `sherick-ui` with `sherick-ui/styles.css` loaded after your host CSS. The frame supplies Sherick's surface, rounding and clipping; `className` styles the frame. Native props and refs go to the inner `<img>` or `<video>`.

```tsx
import { Media } from "sherick-ui";

<Media.Image src="/office.jpg" alt="The office meeting room" />
<Media.Image src="/office.jpg" alt="Meeting room detail" aspect="square" fit="cover" position="top" />
<Media.Image src="/texture.jpg" decorative />

<Media.Video src="/demo.mp4" poster="/demo-poster.jpg" controls aria-label="Product demonstration" />
<Media.Video src="/preview.mp4" poster="/preview.jpg" aspect="video" fit="cover" controls aria-label="Cropped preview" />
<Media.Video src="/background.mp4" autoPlay muted loop decorative />
```

Images use their natural dimensions by default (responsive up to their container); a chosen `aspect` fills the container and defaults to `cover`. Video fills its container but keeps its source ratio with `contain` by default: choose both `aspect` and `fit="cover"` only when cropping is appropriate. Available aspects: `auto`, `square`, `portrait`, `landscape`, `video`, `wide`. `fit` accepts `cover` or `contain`, `position` accepts `center`, `top` or `bottom`, and `radius="none"` leaves the frame square for a parent that owns its corners. The video frame has a dark neutral canvas behind unloaded frames and letterboxing; controls remain native, with a visible keyboard focus treatment. Images default to lazy loading, videos to metadata preload and inline playback; native `loading`, `preload` and `playsInline` override these defaults.

Content images require `alt` (describe their meaning; use `decorative` instead for redundant ornament). `decorative` video is hidden from accessibility APIs, removed from keyboard navigation and cannot expose controls; never use it for information that is not available elsewhere. Meaningful video needs an accessible name and captions when it carries speech or essential audio; use native `<source>` and `<track>` children:

```tsx
<Media.Video poster="/poster.jpg" controls aria-label="Product tour">
  <source src="/tour.webm" type="video/webm" />
  <source src="/tour.mp4" type="video/mp4" />
  <track kind="captions" src="/tour-en.vtt" srcLang="en" label="English" default />
</Media.Video>
```

Media owns presentation, not placement: put it inside your Card, Hero or gallery layout without teaching it about those parents. It does not optimize images or replace the browser's playback controls. Framework-specific image renderers can compose their own delivery outside this native-element primitive.
