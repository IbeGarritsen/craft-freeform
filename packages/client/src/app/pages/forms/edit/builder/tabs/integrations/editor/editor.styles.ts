import { colors, spacings } from '@ff-client/styles/variables';
import styled from 'styled-components';

export const EditorWrapper = styled.div`
  height: 100%;
  display: flex;
  flex-direction: column;
  padding: ${spacings.lg};
  width: calc(100% - 300px);
  background: ${colors.white};
`;

export const DebugContainer = styled.div`
  width: 100%;
  height: 350px;
  display: flex;
  overflow-x: scroll;
  background-color: #efefef;
`;
