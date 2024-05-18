# Static Pages / Starter

Yet another static pages generator?
Yes! Because I browsed the whole jamstack scene, but could not find one which
1. can read input from any source (YAML, JSON, front-matter style markdowns, database etc.)
2. can render with any template engine (Twig, ejs, Pug, Mustache etc.)
3. written in JS (preferably TypeScript)
4. easy to extend with JS code
5. supports incremental builds
6. uses MVC pattern
7. learning and using is easy (Gatsby, Hugo, Jekyll, Eleventy etc. are so cool but harder to learn and configure)

And because I wrote a ton of custom static generators before; I tought I can improve the concepts to a point where its (hopefully) useful for others.

This project is structured as a toolkit split to many packages, published under the [@static-pages](https://www.npmjs.com/search?q=%40static-pages) namespace on NPM.
This package is a good point to begin with.

## Where should I use this?

This project targets small and medium sized websites. The rendering process tries to be as fast as possible so its also useful when you need performance.

## Usage

```js
import staticPages from '@static-pages/starter/node.mjs';
import twig from '@static-pages/twig';

staticPages({
    from: {
        cwd: 'pages',
        pattern: '*.md'
    },
    controller(data) {
        data.now = new Date().toJSON();
        return data;
    },
    to: {
        render: twig({ viewsDir: 'views' })
    }
})
.catch(error => {
    console.error('Error:', error);
    console.error(error.stack);
});
```

## Documentation

For detailed information, visit the [project page](https://staticpagesjs.github.io/).

### `staticPages(...routes: Route[]): Promise<void>`

Each route consists of a `from`, `to` and a `controller` property matching the definition below.

```ts
interface Route<F, T> {
    from: Iterable<F> | AsyncIterable<F> | ReadOptions<F>;
    to: { (data: T): void | Promise<void>; } | WriteOptions<T>;
    controller?(data: F): undefined | T | Iterable<T> | AsyncIterable<T> | Promise<undefined | T | Iterable<T> | AsyncIterable<T>>;
}
```

The `controller` may return with multiple documents, each will be rendered as a separate page. Alternatively it may return `undefined` to prevent the rendering of the current document.

## Missing a feature?
Create an issue describing your needs!
If it fits the scope of the project I will implement it.
