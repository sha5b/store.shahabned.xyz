import { writable } from 'svelte/store';

export const userInfo = writable({
	email: '',
	firstName: '',
	lastName: '',
	address: '',
	apartment: '',
	postalCode: '',
	city: '',
	phone: '',
	country: 'Austria',
	orderId: null // Add orderId to the store
});
