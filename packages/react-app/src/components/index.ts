import styled from "styled-components";

export const Button = styled.button`
  background: #121212;
  border: 1px solid #272727;
  border-radius: 10px;
  color: #fff;
  cursor: pointer;
  font-size: 16px;
  font-weight: 700;
  margin: 0px 20px;
  padding: 6px 10px;
  text-align: center;
  text-decoration: none;

  &.active {
    background: #FFF;
    color: #000;
  }
`;

export const Input = styled.input`
  color: #282c34;
  font-size: 16px;
  padding: 10px;
  text-align: center;
  text-decoration: none;
  display: inline-block;
  width: 100%;
  box-sizing: border-box;
  border: 1px solid #e2e8f0;
  background: transparent;
  border-radius: 6px;
  color: #FFF;
`;

export const AlertError = styled.div`
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