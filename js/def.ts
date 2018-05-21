// 用户接口
interface User {
	id: number;
	name: string;
	idNo: string;
	sex?: string; // 可选
	phone: string;
	pswd: string;
	img: string;
	orgName: string;
	orgNo: string;
	pinying: string;
	py: string; // 简拼
	reason: string; // 加入支部的缘由
	groupId: number; // 所在党小组号
}

// 组织接口
interface Organization {
	id: number;
	name: string;
	no: string;
	secretary: string;
	type: string;
	pswd: string;
	superOrgName: string;
	superOrgNo: string;
}

// callAjax返回数据结构
interface CallAjaxReturn {
	success: boolean;
	errMsg: string;
	data: any;
}

declare function _get(n: string): string;
declare function _set(n: string, d: string): void;
declare function _load(n: string): any;
declare function openWindow(f: string, n: string): void;
declare function _callAjax(params: any, f: (d: CallAjaxReturn) => void): void;

declare var plus: any;
declare var mui: any;
declare var Vue: any;

export {
	User, Organization, _get, _load, plus,
	mui, openWindow, _callAjax, _set, Vue,
}
