/** @jsx jsx */
import { css, jsx } from '@emotion/core'

const Part = ({children, percentageWidth}) => {
return  (
      <div
        css={css`
          width: ${percentageWidth};
          align-self: flex-start;
        `}
      >
        {children}
      </div>
)
}

const SplitContainer = ({children, style}) => (
    <div
      css={css`
        display: flex;
        flex-direction: row;
        height: 100%;
        width: 100%;
      `}
      style={style}
  >
  {children}
</div>
)

export { SplitContainer, Part };
