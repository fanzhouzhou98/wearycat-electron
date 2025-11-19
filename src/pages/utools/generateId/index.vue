<template>
  <div>
    <div class="form-step-container">
      <t-card :title="'生成条件'" :bordered="false">
        <t-form ref="form" :data="formData" :layout="'inline'" :rules="FORM_RULES" @submit="onSubmit">
          <t-form-item label="证件类型" name="idType">
            <t-select v-model="formData.idType" style="width: 200px; display: inline-block; margin-right: 20px"
              clearable filterable>
              <t-option v-for="(item, index) in ID_TYPE_OPTIONS" :key="index" :value="item.value" :label="item.label">
                {{ item.label }}
              </t-option>
            </t-select>
          </t-form-item>
          <t-form-item v-if="formData.idType === '1'" label="省市区" name="area">
            <t-cascader :options="areaOptions" v-model="formData.area" />
          </t-form-item>
          <t-form-item label="证件号" name="idNumber">
            <t-input v-model="formData.idNumber" placeholder="请输入证件号最多30字符" :maxcharacter="60"></t-input>
          </t-form-item>
          <t-form-item label="出生日期" name="birthday">
            <t-date-picker v-model="formData.birthday" />
          </t-form-item>
          <t-form-item label="性别" name="gender">
            <t-radio-group v-model="formData.gender">
              <t-radio v-for="(item, index) in GENDER_OPTIONS" :value="item.value" :key="index">{{ item.label
              }}</t-radio>
            </t-radio-group>
          </t-form-item>
          <t-form-item v-if="formData.idType === '1'" label="省市区" name="area">
            <t-cascader :options="areaOptions" v-model="formData.area" />
          </t-form-item>
          <t-form-item v-if="formData.idType === '1'" label="姓名" name="name">
            <t-input v-model="formData.name" placeholder="请输入姓名" />
          </t-form-item>
          <t-form-item v-if="formData.idType === '1'" label="有效期" name="startDateAndEndDate">
            <t-date-range-picker v-model="formData.startDateAndEndDate" type="daterange" />
          </t-form-item>
          <t-form-item v-if="formData.idType === '1'" label="住址" name="address">
            <t-input v-model="formData.address" placeholder="请输入住址最多30字符" :maxcharacter="60"></t-input>
          </t-form-item>
          <t-form-item>
            <t-space size="small">
              <t-button theme="primary" type="submit">生成</t-button>
            </t-space>
          </t-form-item>
        </t-form>
      </t-card>
      <t-card :title="'生成结果'" :bordered="false" class="result-card">
        <t-list stripe>
          <t-list-item v-for="id in idList" :key="id">
            {{ id }}
            <template #action>
              <t-link theme="primary" hover="color" style="margin-left: 16px" @click="handleCopy(id)"> 复制 </t-link>
              <t-link v-if="formData.idType === '1'" theme="primary" hover="color" style="margin-left: 16px"
                @click="handleGenerateImage(id)"> 生成图片
              </t-link>
            </template>
          </t-list-item>
        </t-list>
      </t-card>
    </div>
    <t-dialog v-model:visible="visibleImageDialog" header="证件图片预览">
      <img :src="currentImage" class="preview-image" />
      <img :src="currentBackImage" class="preview-image" />
      <template #footer>
        <t-button @click="downloadImage">下载图片</t-button>
      </template>
    </t-dialog>
  </div>
</template>

<script lang="ts">
export default {
  name: 'FormStep',
};
</script>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { SubmitContext, Data, MessagePlugin } from 'tdesign-vue-next';
import { areaList } from '@vant/area-data';
//@ts-ignore
import baseImg from '@/assets/122233311.jpg'
//@ts-ignore
import baseImg2 from '@/assets/22222222222.jpg'
import useClipboard from 'vue-clipboard3';
import {
  FORM_RULES,
  ID_TYPE_OPTIONS,
  GENDER_OPTIONS,
  INITIAL_DATA
} from './constants';

const visibleImageDialog = ref(false);
const currentImage = ref('');
const currentBackImage = ref('');
const backgroundImage = ref(''); // 存储证件背景图
let areaDataList = [];
//@ts-ignore
let cityList = []
let countyList = []

let idList = ref([])
let areaOptions = ref([])
const formData = ref({ ...INITIAL_DATA });
const onSubmit = (result: SubmitContext<Data>, val: number) => {
  if (result.validateResult === true) {
    console.log('表单提交成功', formData.value, val);
    generate()
  } else {
    MessagePlugin.warning('请填写完整信息');
    return;
  }
};

const getRandomNumber = (arr: string[]) => {
  return arr[Math.floor(Math.random() * arr.length)];
}
// 新增性别相关随机数生成函数
const generateGenderBasedRandom = (sex: string) => {
  let num;
  do {
    // 生成前两位随机数（00-99）
    const firstTwo = Math.floor(Math.random() * 100).toString().padStart(2, '0');

    // 根据性别生成最后一位
    const lastDigit = sex === '1'
      ? 2 * Math.floor(Math.random() * 5) + 1  // 奇数（1,3,5,7,9）
      : 2 * Math.floor(Math.random() * 5);     // 偶数（0,2,4,6,8）

    num = parseInt(`${firstTwo}${lastDigit}`);
  } while (num === 0); // 排除000的情况

  return num.toString().padStart(3, '0');
};
function generateCheckCode(idBase: string) {
  // 参数验证
  if (typeof idBase !== 'string' || idBase.length !== 17) {
    MessagePlugin.warning('需要17位数字基础码');
  }

  const c = [7, 9, 10, 5, 8, 4, 2, 1, 6, 3, 7, 9, 10, 5, 8, 4, 2];
  const b = ['1', '0', 'X', '9', '8', '7', '6', '5', '4', '3', '2'];

  let sum = 0;
  for (let k = 0; k < 17; k++) {
    const num = parseInt(idBase[k], 10);
    if (isNaN(num)) {
      MessagePlugin.warning(`第${k + 1}位非数字字符: ${idBase[k]}`);
    }
    sum += num * c[k];
  }

  const checkCode: string = b[sum % 11];
  return checkCode === '10' ? 'X' : checkCode;
}
const generateForeignID = (birthday: string, sex: string) => {
  // ISO 3166-1:2006 国家或者地区代码(部分)
  let countyCodes: string[] = [
    '004', '008', '012', '020', '024', '032', '051', '040', '840', '392', '276', '643', '682',
    '732', '734', '736', '738', '740', '742', '744', '746', '748', '750', '752', '754', '756',
    '044', '048', '050', '052', '054', '056', '058', '060', '062', '064', '066', '068', '070',
    '120', '122', '124', '126', '128', '130', '132', '134', '136', '138', '140', '142', '144',
    '203', '205', '207', '209', '211', '213', '215', '217', '219', '221', '223', '225', '227',
    '303', '305', '307', '309', '311', '313', '315', '317', '319', '321', '323', '325', '327',
    '603', '605', '607', '609', '611', '613', '615', '617', '619', '621', '623', '625', '627',
  ]
  // 中国省份两位编码（GB/T 2260标准）
  const provinceCodes: string[] = [
    "11", "12", "13", "14", "15", "21", "22", "23", "31", "32", "33", "34", "35", "36", "37", "41", "42",
    "43", "44", "45", "46", "50", "51", "52", "53", "54", "61", "62", "63", "64", "65", "83", "81", "82"
  ]
  let id: string = `9${getRandomNumber(provinceCodes)}${getRandomNumber(countyCodes)}${birthday.replace(/-/g, '')}${generateGenderBasedRandom(sex)}`
  id = `${id}${generateCheckCode(id)}`
  return id
}
const generateID = (birthday: string, sex: string) => {
  let id: string = `${formData.value.area}${birthday.replace(/-/g, '')}${generateGenderBasedRandom(sex)}`
  id = `${id}${generateCheckCode(id)}`
  return id
}
const generate = () => {
  idList.value = [];
  for (let i = 0; i < 5; i++) {
    const foreignID = formData.value.idNumber ? formData.value.idNumber : (formData.value.idType === '1' ? generateID(formData.value.birthday, formData.value.gender) : generateForeignID(formData.value.birthday, formData.value.gender));
    //@ts-ignore
    idList.value.push(foreignID);
  }
  MessagePlugin.closeAll();
  MessagePlugin.success('生成成功');
}
onMounted(() => {
  console.log(areaList, '组件挂载成功');
  for (const key in areaList.province_list) {
    areaDataList.push({
      value: key,
      label: areaList.province_list[key]
    })
  }
  for (const key in areaList.city_list) {
    cityList.push({
      value: key,
      label: areaList.city_list[key]
    })
  }
  for (const key in areaList.county_list) {
    countyList.push({
      value: key,
      label: areaList.county_list[key]
    })
  }
  let areaData = areaDataList.map(p => {
    return {
      value: p.value,
      label: p.label,
      children: cityList.filter(c => c.value.startsWith(normalizeDivisionCode(p.value))).map(c => {
        return {
          value: c.value,
          label: c.label,
          children: countyList.filter(co => co.value.startsWith(normalizeDivisionCode(c.value))).map(co => {
            return {
              value: co.value,
              label: co.label,
            }
          })
        }
      })
    }
  })
  //@ts-ignore
  areaOptions.value = areaData
  console.log(areaData, 'areaData')
})
function normalizeDivisionCode(code: string): string {
  // 处理省级编码（2位）
  if (/^\d{2}0{4}$/.test(code)) {
    return code.substring(0, 2);
  }
  // 处理市级编码（4位）
  if (/^\d{4}0{2}$/.test(code)) {
    return code.substring(0, 4);
  }
  // 区级编码保持原样
  return code;
}


// 生成证件图片
//@ts-ignore
const generateIDImage = async (idNumber: string) => {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d')!;

  // 加载背景图片
  const img = new Image();
  img.src = backgroundImage.value || baseImg;
  console.log(img.src, 'img.src')
  await new Promise((resolve) => (img.onload = resolve));

  // 设置canvas尺寸
  canvas.width = img.width;
  canvas.height = img.height;

  // 绘制背景
  ctx.drawImage(img, 0, 0);

  // 设置文字样式
  ctx.font = '26px SimHei';
  ctx.fillStyle = '#000';
  ctx.textAlign = 'left';

  // 在指定位置绘制证件号码（坐标需要根据实际背景图调整）
  // 新代码（增加字符间距）：
  const letterSpacing = 16; // 字符间距（像素）
  let xPosition = 250;      // 初始X坐标
  for (const char of idNumber) {
    ctx.fillText(char, xPosition, 395);
    xPosition += letterSpacing;
  }
  if (formData.value.idType === '1') {
    // 在指定位置绘制姓名（坐标需要根据实际背景图调整）
    if (formData.value.name) {
      ctx.font = '25px SimHei';
      ctx.fillStyle = '#000';
      ctx.textAlign = 'left';
      ctx.fillText(formData.value.name, 145, 105);
    }
    if (formData.value.gender) {
      ctx.font = '25px SimHei';
      ctx.fillStyle = '#000';
      ctx.textAlign = 'left';
      ctx.fillText(formData.value.gender === '1' ? '男' : '女', 145, 155);
    }
    if (formData.value.birthday) {
      let birthday = formData.value.birthday.split('-');
      ctx.font = '25px SimHei';
      ctx.fillStyle = '#000';
      ctx.textAlign = 'left';
      ctx.fillText(birthday[0], 145, 210);
      ctx.fillText(birthday[1], 255, 210);
      ctx.fillText(birthday[2], 315, 210);
    }
    if (formData.value.address) {
      ctx.font = '25px SimHei';
      ctx.fillStyle = '#000';
      ctx.textAlign = 'left';
      // 新增换行逻辑
      const maxCharsPerLine = 11; // 每行最多11个字符
      const lineHeight = 35; // 行高
      let currentLine = 0;

      for (let i = 0; i < formData.value.address.length; i += maxCharsPerLine) {
        const lineText = formData.value.address.substring(i, i + maxCharsPerLine);
        ctx.fillText(lineText, 145, 265 + currentLine * lineHeight);
        currentLine++;
      }
    }
  }
  return canvas.toDataURL('image/jpeg');
};
// 生成证件图片
const generateBackIDImage = async () => {
  //@ts-ignore
  let cityName = cityList.find(c => formData.value.area.startsWith(normalizeDivisionCode(c.value)))?.label || '';
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d')!;

  // 加载背景图片
  const img = new Image();
  img.src = backgroundImage.value || baseImg2;
  console.log(img.src, 'img.src')
  await new Promise((resolve) => (img.onload = resolve));

  // 设置canvas尺寸
  canvas.width = img.width;
  canvas.height = img.height;

  // 绘制背景
  ctx.drawImage(img, 0, 0);

  // 设置文字样式
  if (formData.value.idType === '1') {
    // 在指定位置绘制姓名（坐标需要根据实际背景图调整）
    if (formData.value.area) {
      ctx.font = '36px SimHei';
      ctx.fillStyle = '#000';
      ctx.textAlign = 'left';
      ctx.fillText(`${cityName}公安局`, 420, 510);
    }
    //@ts-ignore
    if (formData.value.startDateAndEndDate && formData.value.startDateAndEndDate.length === 2) {
      ctx.font = '36px Microsoft YaHei';
      ctx.fillStyle = '#000';
      //@ts-ignore
      ctx.fillText(formData.value.startDateAndEndDate[0].replaceAll('-', '.'), 420, 595);
      ctx.fillText('-', 620, 595);
      //@ts-ignore
      ctx.fillText(formData.value.startDateAndEndDate[1].replaceAll('-', '.'), 640, 595);
    }
  }
  return canvas.toDataURL('image/jpeg');
};

// 点击生成图片
const handleGenerateImage = async (id: string) => {
  // try {
  currentImage.value = await generateIDImage(id);
  currentBackImage.value = await generateBackIDImage();
  visibleImageDialog.value = true;
  // } catch (e) {
  //   MessagePlugin.error(e,'图片生成失败');
  // }
};

// 下载图片
const downloadImage = () => {
  const link = document.createElement('a');
  link.download = `id-${Date.now()}.jpg`;
  link.href = currentImage.value;
  link.click();
  const link2 = document.createElement('a');
  link2.download = `id-${Date.now()}.jpg`;
  link2.href = currentBackImage.value;
  link2.click();
};
const handleCopy = (text: string) => {
  const { toClipboard } = useClipboard();
  toClipboard(text)
    .then(() => {
      MessagePlugin.closeAll();
      MessagePlugin.success('复制成功');
    })
    .catch(() => {
      MessagePlugin.closeAll();
      MessagePlugin.error('复制失败');
    });
};
</script>
<style lang="less" scoped>
@import url('./index.less');
</style>
