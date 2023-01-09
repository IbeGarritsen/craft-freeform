import type { Option } from './table-layout-editor.types';

export const addOption = (
  options: Option[],
  onChange: (value: Option[]) => void
): void => {
  const updatedOptions = [...options];

  updatedOptions.push({
    label: '',
    type: 'text',
    value: '',
  });

  onChange(updatedOptions);
};

export const updateOption = (
  index: number,
  option: Option,
  options: Option[],
  onChange: (value: Option[]) => void
): void => {
  const updatedOptions = [...options];

  updatedOptions[index] = option;

  onChange(updatedOptions);
};

export const deleteOption = (
  index: number,
  options: Option[],
  onChange: (value: Option[]) => void
): void => {
  const updatedOptions = options.filter(
    (option, optionIndex) => optionIndex !== index
  );

  onChange(updatedOptions);
};

export const dragAndDropOption = (
  index: number,
  options: Option[],
  onChange: (value: Option[]) => void
): void => {
  // TODO: Implement
};