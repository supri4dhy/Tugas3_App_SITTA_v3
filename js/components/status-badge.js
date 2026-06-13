Vue.component('status-badge', {
    props: ['qty', 'safety'],
    template: '#tpl-badge',
    computed: {
        statusType() {
            if (this.qty === 0) return 'kosong';
            if (this.qty < this.safety) return 'menipis';
            return 'aman';
        }
    }
});
