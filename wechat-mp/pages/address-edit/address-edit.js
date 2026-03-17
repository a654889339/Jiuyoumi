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
    detail: '',
    isDefault: false,
    region: [],
    saving: false,
  },

  onLoad(options) {
    if (options.id) {
      this.setData({ id: options.id, isEdit: true });
      this.loadAddress();
      wx.setNavigationBarTitle({ title: '编辑地址' });
    } else {
      wx.setNavigationBarTitle({ title: '新增地址' });
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
        this.setData({
          contactName: addr.contactName || addr.name || '',
          contactPhone: addr.contactPhone || addr.phone || '',
          country: country,
          countryIdx: countryIdx,
          customCountry: addr.customCountry || '',
          province: addr.province || '',
          city: addr.city || '',
          district: addr.district || '',
          detail: addr.detailAddress || addr.detail || addr.address || '',
          isDefault: addr.isDefault || false,
          region: [addr.province || '', addr.city || '', addr.district || ''],
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
      customCountry: '',
      region: [],
    });
  },

  onCustomCountryInput(e) {
    this.setData({ customCountry: e.detail.value });
  },

  onNameInput(e) {
    this.setData({ contactName: e.detail.value });
  },

  onPhoneInput(e) {
    this.setData({ contactPhone: e.detail.value });
  },

  onRegionChange(e) {
    const region = e.detail.value;
    this.setData({
      region,
      province: region[0],
      city: region[1],
      district: region[2],
    });
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
      wx.showToast({ title: '请输入联系人', icon: 'none' });
      return;
    }
    if (!contactPhone.trim() || contactPhone.length < 11) {
      wx.showToast({ title: '请输入正确的手机号', icon: 'none' });
      return;
    }
    if (!country) {
      wx.showToast({ title: '请选择国家/地区', icon: 'none' });
      return;
    }
    if (country === '其他' && !customCountry.trim()) {
      wx.showToast({ title: '请输入国家/地区名称', icon: 'none' });
      return;
    }
    if (country === '中国大陆' && !province) {
      wx.showToast({ title: '请选择省市区', icon: 'none' });
      return;
    }
    if (!detail.trim()) {
      wx.showToast({ title: '请输入详细地址', icon: 'none' });
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
      wx.showToast({ title: '保存成功', icon: 'success' });
      setTimeout(() => wx.navigateBack(), 1000);
    } catch (e) {
      wx.showToast({ title: (e && e.message) || '保存失败', icon: 'none' });
    } finally {
      this.setData({ saving: false });
    }
  },
});
