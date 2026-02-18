import 'react';

declare module 'react-scroll';

declare module 'react' {
	interface ImgHTMLAttributes<T> {
		fetchpriority?: 'high' | 'low' | 'auto';
	}
}
