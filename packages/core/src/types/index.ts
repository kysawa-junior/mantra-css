export type CSSProperties = Record<string, string | number>;

export type AnyUtils = Record<string, (...args: any) => any>;

export type CSSWithUtils<TUtils extends AnyUtils> = CSSProperties & {
  [K in keyof TUtils]?: Parameters<TUtils[K]>[0];
};

export type VariantDefinition = {
  [variantName: string]: { [variantValue: string]: CSSProperties };
};

export type StyledConfig<TUtils extends AnyUtils> = {
  base?: CSSWithUtils<TUtils>;
  variants?: VariantDefinition;
  compoundVariants?: Array<{
    variants: Record<string, string>;
    css?: CSSWithUtils<TUtils>;
  }>;
};

export type MantraConfig = {
  theme?: Record<string, Record<string, string>>;
  media?: Record<string, string>;
  utils?: Record<string, (...args: any[]) => CSSProperties>;
};

export type VariantProps<V extends VariantDefinition> = {
  [K in keyof V]?: keyof V[K];
};

// The Vanilla output of the styled function
export interface StyledRecipe<
  TVariants extends VariantDefinition = VariantDefinition,
> {
  element: string;
  baseClassName: string;
  cssText: string;
  variantClassMappings: Record<string, Record<string, string>>;

  // A framework-agnostic function to resolve class names from variant props
  resolve: (props: VariantProps<TVariants> & { className?: string }) => string;
}
