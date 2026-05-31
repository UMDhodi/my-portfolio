import 'react';

declare module 'react' {
  interface HTMLAttributes<T> extends AriaAttributes, DOMAttributes<T> {
    string?: string;
    'string-repeat'?: string;
    'string-split'?: string;
    'string-split-type'?: string;
    'string-enter-vp'?: string;
    'string-exit-vp'?: string;
    'string-parallax'?: string;
    'string-lerp'?: string;
    'string-progress'?: string;
    'string-start'?: string;
    'string-end'?: string;
    'string-cursor-class'?: string;
    'string-cursor-target-style-disable'?: string;
    'string-cursor'?: string;
    'string-cursor-lerp'?: string;
    'string-magnetic'?: string;
    'string-radius'?: string;
    'string-strength'?: string;
    'string-lazy'?: string;
    'string-scrollbar-color'?: string;
    'string-scrollbar-width'?: string;
  }
}