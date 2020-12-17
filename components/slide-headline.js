import React from 'react'
import { css } from '@emotion/core'
import useColors from '../lib/useColors'

const SlideHeadline = ({ children, sectionTitle, separateLine }) => {
  const colors = useColors()

  return (
    <h2
      css={css`
        border-bottom: 1px solid ${colors.headline};
        width: 80vw;
        font-weight: 300;
        color: ${colors.headline};
        margin-top: 0;
        padding-bottom: 12px;
        margin-bottom: 12px;
      `}
    >
      {sectionTitle && (
        <>
          <span
            css={{
              color: colors.primary
              // color: '#edff60'
            }}
          >
            {sectionTitle}
          </span>
          {children && !separateLine && <span> - </span>}
        </>
      )}
    {separateLine ? (
      <div>
      {children}
      </div>
    ) :
        (<span>
          {children}
        </span>)
    }
    </h2>
  )
}

export default SlideHeadline
