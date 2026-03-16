const app = getApp();

Page({
  data: {
    id: '',
    isEdit: false,
    contactName: '',
    contactPhone: '',
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
    }
  },

  async loadAddress() {
    try {
      const res = await app.request({ url: '/addresses' });
      const list = res.data || [];
      const addr = list.find((a) => String(a.id) === String(this.data.id));
      if (addr) {
        this.setData({
          contactName: addr.contactName || addr.name || '',
          contactPhone: addr.contactPhone || addr.phone || '',
          province: addr.province || '',
          city: addr.city || '',
          district: addr.district || '',
          detail: addr.detail || addr.address || '',
          isDefault: addr.isDefault || false,
          region: [addr.province || '', addr.city || '', addr.district || ''],
        });
      }
    } catch (e) {}
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
    const { contactName, contactPhone, province, city, district, detail } = this.data;
    if (!contactName.trim()) {
      wx.showToast({ title: '请输入联系人', icon: 'none' });
      return;
    }
    if (!contactPhone.trim() || contactPhone.length < 11) {
      wx.showToast({ title: '请输入正确的手机号', icon: 'none' });
      return;
    }
    if (!province) {
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
        province,
        city,
        district,
        detail: detail.trim(),
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
      wx.showToast({ title: e.message || '保存失败', icon: 'none' });
    } finally {
      this.setData({ saving: false });
    }
  },
});
