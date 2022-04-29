import styled from "styled-components";

export const FormError = styled.div`
  color: red;
  margin-top: 5px;
`

export const Header = styled.header`
  align-items: center;
  color: white;
  display: flex;
  flex-direction: row;
  justify-content: flex-end;
  min-height: 70px;
`;

export const Image = styled.img`
  height: 40vmin;
  margin-bottom: 16px;
  pointer-events: none;
`;

export const Box = styled.div`
  background: #121212;
  border-radius: 10px;
  border: 1px solid #272727;
  font-size: 16px;
  font-weight: 700;
  margin-bottom: 20px;
`

export const BoxRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px;

  & + & {
    border-top: 1px solid #272727;
  }

  &:hover {
    background: #272727;
  }
`

export const BoxLabelCell = styled.div`
  margin-right: 10px;
  min-width: 30%;
`

export const BoxTitleCell = styled(BoxLabelCell)`
  font-size: 20px;
`

export const AnswerFieldWrapper = styled.div`
  & + & {
    margin-top: 10px;
  }
`

export const AnswerField = styled.div`
  display: inline-flex;
  align-items: center;
`