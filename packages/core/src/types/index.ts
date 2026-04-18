export type CSSProperties = Record<string, string | number>;

export type AnyUtils = Record<string, (...args: any) => any>;

export type CSSWithUtils<TUtils extends AnyUtils> = CSSProperties & {
  [K in keyof TUtils]?: Parameters<TUtils[K]>[0];
};

export type VariantDefinition<TConfig> = {
  [variantName: string]: { [variantValue: string]: CSSProperties };
};

export type StyledConfig<TConfig, TUtils extends AnyUtils> = {
  base?: CSSWithUtils<TUtils>;
  variants?: VariantDefinition<TConfig>;
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

export type StyledComponent<TProps> = (props: TProps & { ref?: React.Ref<HTMLElement> }) => React.ReactElement | null;
