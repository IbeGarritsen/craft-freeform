import { borderRadius, colors, spacings } from '@ff-client/styles/variables';
import styled from 'styled-components';

export const Wrapper = styled.div`
  > a {
    display: flex;
    align-items: center;
    gap: ${spacings.sm};

    padding: ${spacings.sm} ${spacings.md};
    border-radius: ${borderRadius.lg};

    color: ${colors.gray700};
    font-size: 12px;
    line-height: 12px;

    transition: background-color 0.2s ease-out;
    text-decoration: none;

    &.active {
      background-color: ${colors.gray200};
    }

    &:hover:not(.active) {
      background-color: ${colors.gray100};
    }
  }
`;

export const Icon = styled.div`
  display: block;
  width: 20px;
  height: 20px;
`;

export const Name = styled.div`
  flex-grow: 1;
`;

type StatusProps = {
  enabled?: boolean;
};

export const Status = styled.div<StatusProps>`
  content: '';

  justify-self: flex-end;

  width: 10px;
  height: 10px;

  border: 1px solid
    ${({ enabled }): string => (enabled ? 'transparent' : colors.gray550)};
  border-radius: 100%;

  background-color: ${({ enabled }): string =>
    enabled ? colors.teal550 : 'transparent'};

  transition: all 0.3s ease-out;
`;