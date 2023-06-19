import React, { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import useManagerFormStore from '@/store/managerForm';
import { postManagerForm } from '@/apis/manager';

import SupportModal from '../SupportModal';

import * as U from '../UnCompleteModal/style';
import * as S from './style';

interface CheckModalProps {
  setIsSubmitClicked: (isClicked: boolean) => void;
}

function CheckModal({ setIsSubmitClicked }: CheckModalProps) {
  const { mutate, isLoading } = useMutation(postManagerForm, {
    onSuccess(data) {
      setVisible(data);
    },
  });

  // state
  const {
    manager_name,
    manager_phone,
    activity_day,
    activity_region,
    manager_license,
    manager_license_etc,
    field_experience,
    main_job,
    main_job_etc,
    manager_drive,
  } = useManagerFormStore((state) => state);

  const [visible, setVisible] = useState(false);

  let certificate;
  switch (manager_license) {
    case 'FIRST_RATE_OFF':
      certificate = '1급 (오프라인 취득)';
      break;

    case 'SECOND_RATE_OFF':
      certificate = '2급 (오프라인 취득)';
      break;

    case 'FIRST_RATE_ON':
      certificate = '1급 (온라인 취득)';
      break;

    case 'SECOND_RATE_ON':
      certificate = '2급 (온라인 취득)';
      break;

    case 'NONE':
      certificate = '없음';
      break;

    case 'ETC':
      certificate = '기타';
      break;

    default:
      break;
  }

  // 활동 가능 요일
  const resultDays = activity_day
    .map((value: boolean, index: number) => {
      if (index === 0 && value) return '월';
      else if (index === 1 && value) return '화';
      else if (index === 2 && value) return '수';
      else if (index === 3 && value) return '목';
      else if (index === 4 && value) return '금';
      else if (index === 5 && value) return '토';
      else if (index === 6 && value) return '일';
    })
    .filter((day: string | undefined) => day !== undefined);

  // 활동 가능 지역
  const combinedArray = activity_region.activity_city.map((cityItem: string, index: number) => {
    const districtItem = activity_region.activity_district[index];
    return `${cityItem.slice(0, 2)} ${districtItem}`;
  });
  const sortedArray = combinedArray.sort((a: string, b: string) => {
    if (a.includes('서울') && !b.includes('서울')) {
      return -1;
    } else if (!a.includes('서울') && b.includes('서울')) {
      return 1;
    } else {
      return 0;
    }
  });
  const seperatedArray = sortedArray.map((item: string, index: number) => {
    const separator = index !== activity_region.activity_city.length - 1 ? ' / ' : '';
    return `${item} ${separator}`;
  });

  const submitHandler = () => {
    const phoneNumberWithoutDash = manager_phone.replace(/-/g, '');

    mutate({
      manager_name,
      manager_phone: phoneNumberWithoutDash,
      activity_day,
      activity_region,
      manager_license,
      manager_license_etc,
      field_experience,
      main_job,
      main_job_etc,
      manager_drive,
    });
  };

  return (
    <>
      <S.CheckModal>
        <S.Header>
          <h1>열다 옷장정리 매니저 신청</h1>

          <p>
            작성이 완료 되었습니다!
            <br />
            작성해주신 내용을 확인해주세요.😁
          </p>
        </S.Header>

        <div>
          <S.InputContents>
            <S.Content>
              <h3>매니저 정보</h3>
              <dl>
                <div>
                  <dt>이름</dt>
                  <dd>{manager_name}</dd>
                </div>

                <div>
                  <dt>연락처</dt>
                  <dd>{manager_phone}</dd>
                </div>

                <div>
                  <dt>활동 가능 요일</dt>
                  <dd>
                    {resultDays.map((day: string | undefined, index: number) => {
                      if (index === resultDays.length - 1) return <span key={day}>{day}</span>;
                      else if (day) return <span key={day}>{day}, </span>;
                    })}
                  </dd>
                </div>

                <div>
                  <dt>활동 가능 지역</dt>
                  <dd>{seperatedArray}</dd>
                </div>
              </dl>
            </S.Content>

            <S.Content>
              <h3>경력 정보</h3>
              <dl>
                <div>
                  <dt>자격증</dt>
                  {manager_license !== 'ETC' && <dd>{certificate}</dd>}
                  {manager_license === 'ETC' && <dd>{manager_license_etc}</dd>}
                </div>

                <div>
                  <dt>본업여부</dt>
                  {!main_job_etc && !main_job && <dd>아님</dd>}
                  {main_job_etc && <dd>{main_job_etc}</dd>}
                </div>

                <div>
                  <dt>자차 운전여부</dt>
                  <dd>{manager_drive ? '있음' : '없음'}</dd>
                </div>

                <div>
                  <dt>현장경험</dt>
                  <dd>{field_experience.slice(0, 150)}</dd>
                </div>
              </dl>
            </S.Content>
          </S.InputContents>

          <U.ButtonGrop isLoading={isLoading}>
            <button type="button" onClick={() => setIsSubmitClicked(false)}>
              수정할래요.
            </button>
            {!isLoading && (
              <button type="button" onClick={submitHandler}>
                네, 맞아요!
              </button>
            )}
            {isLoading && (
              <button type="button" onClick={submitHandler}>
                신청중...
              </button>
            )}
          </U.ButtonGrop>
        </div>
      </S.CheckModal>

      {visible && <SupportModal />}
    </>
  );
}

export default CheckModal;
