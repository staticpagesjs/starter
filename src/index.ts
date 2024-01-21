import type { Route as BaseRoute } from '@static-pages/core';
import { staticPages as baseStaticPages } from '@static-pages/core';
// @ts-ignore CJS compilation step cannot handle node16 style imports
import type { ReadOptions, WriteOptions, Filesystem } from '@static-pages/io';
// @ts-ignore CJS compilation step cannot handle node16 style imports
import { read, isReadOptions, write, isWriteOptions } from '@static-pages/io';

const isIterable = <T>(x: unknown): x is Iterable<T> => !!x && typeof x === 'object' && Symbol.iterator in x && typeof x[Symbol.iterator] === 'function';
const isAsyncIterable = <T>(x: unknown): x is AsyncIterable<T> => !!x && typeof x === 'object' && Symbol.asyncIterator in x && typeof x[Symbol.asyncIterator] === 'function';

export interface Route<F = unknown, T = unknown> {
    from: BaseRoute['from'] | ReadOptions<F>;
    to: BaseRoute['to'] | WriteOptions<T>;
    controller?: BaseRoute['controller'];
}

export async function staticPages<F1, T1>(...route: [Route<F1, T1>]): Promise<void>;
export async function staticPages<F1, T1, F2, T2>(...route: [Route<F1, T1>, Route<F2, T2>]): Promise<void>;
export async function staticPages<F1, T1, F2, T2, F3, T3>(...route: [Route<F1, T1>, Route<F2, T2>, Route<F3, T3>]): Promise<void>;
export async function staticPages<F1, T1, F2, T2, F3, T3, F4, T4>(...route: [Route<F1, T1>, Route<F2, T2>, Route<F3, T3>, Route<F4, T4>]): Promise<void>;
export async function staticPages<F1, T1, F2, T2, F3, T3, F4, T4, F5, T5>(...route: [Route<F1, T1>, Route<F2, T2>, Route<F3, T3>, Route<F4, T4>, Route<F5, T5>]): Promise<void>;
export async function staticPages<F1, T1, F2, T2, F3, T3, F4, T4, F5, T5, F6, T6>(...route: [Route<F1, T1>, Route<F2, T2>, Route<F3, T3>, Route<F4, T4>, Route<F5, T5>, Route<F6, T6>]): Promise<void>;
export async function staticPages(...routes: Route[]): Promise<void>;

export async function staticPages(...routes: Route[]): Promise<void> {
    return baseStaticPages(
        ...routes.map(
            ({ from, to, controller }) => ({
                from: isReadOptions(from) ? read(from) : from,
                to: isWriteOptions(to) ? write(to) : to,
                controller: controller,
            })
        )
    );
}

export function configureStaticPages({ from, to, controller }: Partial<Route>) {
    return function modifiedStaticPages(...routes: Partial<Route>[]): Promise<void> {
        return staticPages(...routes.map(route => ({
            from: route.from && typeof route.from === 'object' && !isIterable(route.from) && !isAsyncIterable(route.from) &&
                from && typeof from === 'object' && !isIterable(from) && !isAsyncIterable(from)
                ? { ...from, ...route.from }
                : route.from !== undefined ? route.from : from!, // lest hope user provides every required options

            to: route.to && typeof route.to === 'object' &&
                to && typeof to === 'object'
                ? { ...to, ...route.to }
                : route.to !== undefined ? route.to : to!, // lest hope user provides every required options

            controller: route.controller !== undefined ? route.controller : controller,
        })));
    };
}
