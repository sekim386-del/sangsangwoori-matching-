import RegisterForm from './RegisterForm';

export default function RegisterPage() {
  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-4xl font-bold text-gray-900 mb-2">시니어 일자리 신청하기</h1>
      <p className="text-xl text-gray-600 mb-10">
        정보를 입력해 주시면 담당자가 맞는 일자리를 찾아드립니다.
      </p>
      <RegisterForm />
    </div>
  );
}
