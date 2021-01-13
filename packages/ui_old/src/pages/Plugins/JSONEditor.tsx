import { FC } from 'react'
import { ControlledEditor } from '@monaco-editor/react'

export interface JSONEditorProps {
  value?: string
  onChange?: (value: string | undefined) => void
}

export const JSONEditor: FC<JSONEditorProps> = ({ value, onChange }) => {
  return (
    <ControlledEditor
      value={value}
      onChange={(ev, value) => onChange?.(value)}
      height="20rem"
      language="json"
      width="100%"
      options={{
        lineNumbers: 'off'
      }}
    />
  )
}
