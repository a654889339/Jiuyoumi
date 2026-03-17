const app = getApp();

const COUNTRIES = ['中国大陆', '中国香港', '中国澳门', '中国台湾', '美国', '英国', '日本', '韩国', '新加坡', '澳大利亚', '加拿大', '德国', '法国', '马来西亚', '泰国', '其他'];

Page({
  data: {
    id: '',
    isEdit: false,
    contactName: '',
    contactPhone: '',
    countries: COUNTRIES,
    countryIdx: 0,
    country: '中国大陆',
    customCountry: '',
    province: '',
    city: '',
    district: '',
    regionText: '',
    detail: '',
    isDefault: false,
    saving: false,
  },

  onLoad(options) {
    if (options.id) {
      this.setData({ id: options.id, isEdit: true });
      this.loadAddress();
      my.setNavigationBar({ title: '编辑地址' });
    } else {
      my.setNavigationBar({ title: '新增地址' });
      var phone = (app.globalData.userInfo && app.globalData.userInfo.phone) || '';
      if (phone) this.setData({ contactPhone: phone });
    }
  },

  async loadAddress() {
    try {
      const res = await app.request({ url: '/addresses' });
      const list = res.data || [];
      const addr = list.find((a) => String(a.id) === String(this.data.id));
      if (addr) {
        var country = addr.country || '中国大陆';
        var countryIdx = COUNTRIES.indexOf(country);
        if (countryIdx < 0) countryIdx = 0;
        var regionText = [addr.province, addr.city, addr.district].filter(Boolean).join(' ');
        this.setData({
          contactName: addr.contactName || addr.name || '',
          contactPhone: addr.contactPhone || addr.phone || '',
          country: country,
          countryIdx: countryIdx,
          customCountry: addr.customCountry || '',
          province: addr.province || '',
          city: addr.city || '',
          district: addr.district || '',
          regionText: regionText,
          detail: addr.detailAddress || addr.detail || addr.address || '',
          isDefault: addr.isDefault || false,
        });
      }
    } catch (e) {}
  },

  onCountryChange(e) {
    var idx = parseInt(e.detail.value, 10);
    this.setData({
      countryIdx: idx,
      country: COUNTRIES[idx],
      province: '',
      city: '',
      district: '',
      regionText: '',
      customCountry: '',
    });
  },

  onCustomCountryInput(e) {
    this.setData({ customCountry: e.detail.value });
  },

  onRegionInput(e) {
    var parts = (e.detail.value || '').trim().split(/\s+/);
    this.setData({
      regionText: e.detail.value,
      province: parts[0] || '',
      city: parts[1] || '',
      district: parts[2] || '',
    });
  },

  onNameInput(e) {
    this.setData({ contactName: e.detail.value });
  },

  onPhoneInput(e) {
    this.setData({ contactPhone: e.detail.value });
  },

  onDetailInput(e) {
    this.setData({ detail: e.detail.value });
  },

  onDefaultChange(e) {
    this.setData({ isDefault: e.detail.value });
  },

  async save() {
    const { contactName, contactPhone, country, customCountry, province, city, district, detail } = this.data;
    if (!contactName.trim()) {
      my.showToast({ content: '请输入联系人', type: 'none' });
      return;
    }
    if (!contactPhone.trim() || contactPhone.length < 11) {
      my.showToast({ content: '请输入正确的手机号', type: 'none' });
      return;
    }
    if (!country) {
      my.showToast({ content: '请选择国家/地区', type: 'none' });
      return;
    }
    if (country === '其他' && !customCountry.trim()) {
      my.showToast({ content: '请输入国家/地区名称', type: 'none' });
      return;
    }
    if (country === '中国大陆' && !province) {
      my.showToast({ content: '请填写省市区', type: 'none' });
      return;
    }
    if (!detail.trim()) {
      my.showToast({ content: '请输入详细地址', type: 'none' });
      return;
    }

    this.setData({ saving: true });
    try {
      const payload = {
        contactName: contactName.trim(),
        contactPhone: contactPhone.trim(),
        country: country,
        customCountry: country === '其他' ? customCountry.trim() : '',
        province: province || '',
        city: city || '',
        district: district || '',
        detailAddress: detail.trim(),
        isDefault: this.data.isDefault,
      };

      if (this.data.isEdit) {
        await app.request({ url: `/addresses/${this.data.id}`, method: 'PUT', data: payload });
      } else {
        await app.request({ url: '/addresses', method: 'POST', data: payload });
      }
      my.showToast({ content: '保存成功' });
      setTimeout(() => my.navigateBack(), 1000);
    } catch (e) {
      my.showToast({ content: (e && e.message) || '保存失败', type: 'none' });
    } finally {
      this.setData({ saving: false });
    }
  },
});
