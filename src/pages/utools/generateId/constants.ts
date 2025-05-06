import { FormRule } from 'tdesign-vue-next';

export const FORM_RULES: Record<string, FormRule[]> = {
  idType: [{ required: true, message: '请选择证件类型', type: 'error' }],
  gender: [{ required: true, message: '请选择性别', type: 'error' }],
  birthday: [{ required: true, message: '请选择出生日期', type: 'error' }],
  area: [{ required: true, message: '请选择省市区', type: 'error' }],
  address: [{ required: false, message: '请输入详细地址', type: 'error' }],
  startDateAndEndDate: [{ required: false, message: '请选择有效期', type: 'error' }],
  name: [{ required: false, message: '请输入姓名', type: 'error' }],
};

export const ID_TYPE_OPTIONS = [
  { label: '居民身份证', value: '1' },
  { label: '外国人永久居留身份证', value: '2' },
];

export const GENDER_OPTIONS = [
  { label: '男', value: '1' },
  { label: '女', value: '2' },
]


export const INITIAL_DATA = {
  idType: '1',
  gender: '1',
  birthday: '2000-01-01',
  area: '110101',
  address: '',
  startDateAndEndDate: undefined,
  name: '',
};
