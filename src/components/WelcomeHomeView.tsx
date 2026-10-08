/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Search, Plus, Layers, ShieldCheck, Home, GraduationCap, Building2, ArrowRight, CheckCircle2, Lock, ArrowUpRight, Sparkles, Wallet, Check } from 'lucide-react';
import { UNIVERSITIES } from '../data/universities';
import { SolanaRecordsList } from './SolanaRecordsList';
import { getStoredSolanaRecords } from '../utils/solana';

interface WelcomeHomeViewProps {
  onGoToLedger: (initialIin?: string) => void;
  onGoToBatch: () => void;
  onOpenPaymentModal: () => void;
  totalTransactionsCount: number;
  totalAmountKZT: number;
}

export const WelcomeHomeView: React.FC<WelcomeHomeViewProps> = ({
  onGoToLedger,
  onGoToBatch,
  onOpenPaymentModal,
  totalTransactionsCount,
  totalAmountKZT
}) => {
  const [heroIinInput, setHeroIinInput] = useState('');

  const handleHeroSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (heroIinInput.trim()) {
      onGoToLedger(heroIinInput.trim());
    } else {
      onGoToLedger();
    }
  };

  return (
    <div className="space-y-16 py-4 font-sans text-slate-800 dark:text-slate-100 transition-colors">
      
      {/* SECTION 1: Split Hero (exact visual reproduction of Synflow hero layout in pastel colors) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-stretch">
        
        {/* Left Column: Slender clean typography & action */}
        <div className="lg:col-span-7 flex flex-col justify-between space-y-8 pr-0 lg:pr-4">
          <div className="space-y-6">
            
            {/* Soft Pastel Kicker */}
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-teal-50 dark:bg-teal-950/70 border border-teal-100 dark:border-teal-800/60 rounded-full text-teal-800 dark:text-teal-300 text-xs font-semibold tracking-wide">
              <span>Государственный клиринговый реестр РК</span>
            </div>

            {/* Title with clean, slender, elegant typography */}
            <h1 className="text-4xl sm:text-5xl lg:text-[54px] font-semibold tracking-[-0.03em] text-[#0f172a] dark:text-white leading-[1.12]">
              Учет университетских <br className="hidden sm:inline" />
              сборов с точностью <br className="hidden sm:inline" />
              до тенге
            </h1>

            {/* Calm, readable description */}
            <p className="text-slate-500 dark:text-slate-400 text-sm sm:text-base leading-relaxed max-w-xl font-normal">
              UniChain.kz — единая база данных оплат за обучение и общежития для студентов вузов Казахстана. 
              Каждая транзакция фиксируется в блокчейне с уникальным номером TXID и защитой персональных данных.
            </p>

            {/* Quick Action Buttons + IIN Search Pill */}
            <div className="space-y-3 pt-2">
              <form onSubmit={handleHeroSearch} className="max-w-md">
                <div className="bg-white dark:bg-[#131a23] border border-slate-200/90 dark:border-slate-700/80 p-1.5 pl-4 rounded-full flex items-center gap-2 focus-within:border-teal-600 focus-within:ring-2 focus-within:ring-teal-100 dark:focus-within:ring-teal-900/40 transition-all shadow-sm">
                  <Search className="h-4 w-4 text-slate-400 shrink-0" />
                  <input
                    type="text"
                    value={heroIinInput}
                    onChange={e => setHeroIinInput(e.target.value.replace(/\D/g, ''))}
                    maxLength={12}
                    placeholder="Введите 12-значный ИИН..."
                    className="w-full bg-transparent text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none font-mono"
                  />
                  <button
                    type="submit"
                    className="px-6 py-2.5 text-xs font-semibold text-white bg-[#0b2b2a] hover:bg-[#123e3c] dark:bg-teal-700 dark:hover:bg-teal-600 rounded-full transition-all shrink-0 cursor-pointer shadow-sm active:scale-95 whitespace-nowrap"
                  >
                    Проверить
                  </button>
                </div>
              </form>

              <div className="text-[11px] text-slate-400 dark:text-slate-500 pl-4 font-mono">
                Тестовый ИИН: <span className="text-teal-700 dark:text-teal-400 underline cursor-pointer hover:text-teal-900 dark:hover:text-teal-300" onClick={() => setHeroIinInput('030814501289')}>030814501289</span>
              </div>
            </div>
          </div>

          {/* Stats Row */}
          <div className="pt-6 border-t border-slate-100 dark:border-slate-800/80">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-6">
              <div>
                <div className="text-2xl sm:text-3xl font-semibold text-slate-900 dark:text-white tracking-tight font-mono">
                  8 вузов
                </div>
                <div className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">
                  КазНУ, КБТУ, NU, ЕНУ и др.
                </div>
              </div>

              <div>
                <div className="text-2xl sm:text-3xl font-semibold text-slate-900 dark:text-white tracking-tight font-mono">
                  {totalAmountKZT.toLocaleString('ru-RU')} ₸
                </div>
                <div className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">
                  Зафиксировано в реестре
                </div>
              </div>

              <div className="hidden sm:block">
                <div className="text-2xl sm:text-3xl font-semibold text-teal-700 dark:text-teal-400 tracking-tight font-mono">
                  100% SHA-256
                </div>
                <div className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">
                  Защита данных студентов
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column Bento Box */}
        <div className="lg:col-span-5 flex flex-col gap-4">
          
          {/* Card 1: Dark Contrast Teal Card */}
          <div className="bg-[#0b2b2a] dark:bg-[#071c1b] border border-transparent dark:border-teal-900/60 text-white rounded-3xl p-6 sm:p-7 shadow-md relative overflow-hidden flex flex-col justify-between min-h-[170px]">
            {/* Subtle radial glow */}
            <div className="absolute right-0 top-0 w-44 h-44 bg-teal-500/10 rounded-full blur-2xl pointer-events-none" />
            
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-teal-300 tracking-wider">
                Extra Secure
              </span>
              <div className="h-9 w-9 rounded-full bg-teal-500/20 border border-teal-400/30 flex items-center justify-center text-teal-300">
                <ShieldCheck className="h-4 w-4" />
              </div>
            </div>

            <div className="space-y-1 relative z-10 pt-4">
              <h3 className="text-lg font-semibold tracking-tight text-white leading-snug">
                Неизменяемый реестр гарантирует подлинность
              </h3>
              <p className="text-xs text-teal-100/70 font-light">
                Каждый чек и оплата общежития заверяются криптографической подписью узла.
              </p>
            </div>
          </div>

          {/* Cards 2 & 3: Two pastel cards side-by-side */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 flex-1">
            
            {/* Bottom-Left Pastel Seafoam Card */}
            <div className="bg-[#d4f2ea] dark:bg-[#0c2422] text-[#0a312f] dark:text-teal-100 rounded-3xl p-6 shadow-sm border border-[#c2ebe0] dark:border-[#143e39] flex flex-col justify-between min-h-[220px]">
              <div>
                <span className="text-xs font-semibold text-[#185e59] dark:text-teal-400 block mb-1">
                  Общежития РК
                </span>
                <h4 className="text-base font-semibold text-[#0a312f] dark:text-teal-50 leading-snug">
                  Точный корпус и номер комнаты
                </h4>
              </div>

              {/* Pastel visual badge */}
              <div className="pt-4 space-y-2">
                <div className="p-3 bg-white/70 dark:bg-black/30 backdrop-blur-sm rounded-2xl border border-white/60 dark:border-teal-800/40 shadow-xs space-y-0.5">
                  <div className="text-[11px] font-semibold text-[#0a312f] dark:text-teal-200">Дом студентов №7</div>
                  <div className="text-[10px] text-[#2c6e69] dark:text-teal-400">Комната 412 · КазНУ</div>
                  <div className="text-[11px] font-mono font-bold text-teal-800 dark:text-teal-300 pt-0.5">110 000 ₸</div>
                </div>
              </div>
            </div>

            {/* Bottom-Right Soft Mint Metric Card */}
            <div className="bg-[#edf7f5] dark:bg-[#0f1f22] text-slate-800 dark:text-slate-100 rounded-3xl p-6 border border-[#d6ede7] dark:border-[#18393e] shadow-sm flex flex-col justify-between min-h-[220px]">
              <div>
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 block mb-1">
                  Академический клиринг
                </span>
                <div className="text-2xl font-semibold text-slate-900 dark:text-white font-mono tracking-tight">
                  1 010 000 ₸
                </div>
                <div className="text-[11px] text-teal-700 dark:text-teal-400 font-medium mt-0.5">
                  ↑ 100% подтверждено
                </div>
              </div>

              {/* Soft pastel cylinder bars graphic */}
              <div className="pt-6 flex items-end justify-between gap-2 px-1">
                <div className="w-1/4 h-12 bg-teal-200/80 dark:bg-teal-800/60 rounded-t-xl" />
                <div className="w-1/4 h-16 bg-teal-300/80 dark:bg-teal-700/60 rounded-t-xl" />
                <div className="w-1/4 h-24 bg-teal-600 dark:bg-teal-500 rounded-t-xl" />
                <div className="w-1/4 h-20 bg-teal-400/80 dark:bg-teal-600/80 rounded-t-xl" />
              </div>
            </div>

          </div>

        </div>

      </div>

      {/* SECTION 2: "Make your money move so fast" Section */}
      <div className="pt-6 space-y-8">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-2 border-b border-slate-100 dark:border-slate-800/80">
          <div className="space-y-1.5">
            <span className="text-xs font-semibold text-teal-700 dark:text-teal-400 tracking-wider uppercase">
              INTRODUCTION
            </span>
            <h2 className="text-2xl sm:text-3xl font-semibold tracking-[-0.03em] text-slate-900 dark:text-white">
              Прозрачные университетские сборы
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-md font-normal leading-relaxed">
            Создано для того, чтобы студенты, родители и университеты Казахстана могли легко подтверждать оплату без бумажных справок.
          </p>
        </div>

        {/* 3 Pastel Navigation Cards with (+) marks */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Card 1 */}
          <div
            onClick={() => onGoToLedger()}
            className="p-7 bg-[#f6faf8] dark:bg-[#0f151d] hover:bg-[#edf6f3] dark:hover:bg-[#131d27] border border-[#e1efe9] dark:border-slate-800 rounded-3xl transition-all cursor-pointer group shadow-xs flex flex-col justify-between space-y-6"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="h-9 w-9 rounded-xl bg-white dark:bg-[#182330] border border-teal-100 dark:border-slate-700 flex items-center justify-center text-teal-800 dark:text-teal-300 shadow-xs">
                  <Search className="h-4 w-4" />
                </div>
                <div className="h-7 w-7 rounded-full bg-white dark:bg-[#182330] border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-300 group-hover:bg-[#0b2b2a] dark:group-hover:bg-teal-700 group-hover:text-white transition-colors text-xs font-medium">
                  +
                </div>
              </div>

              <h3 className="text-lg font-semibold tracking-tight text-slate-900 dark:text-white group-hover:text-teal-900 dark:group-hover:text-teal-300 transition-colors">
                Личный кабинет по ИИН
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-normal">
                Введите свой 12-значный ИИН для мгновенного просмотра истории платежей, сводки по семестрам и скачивания официальных квитанций.
              </p>
            </div>

            <div className="flex items-center text-xs font-semibold text-teal-800 dark:text-teal-400 group-hover:translate-x-1 transition-transform">
              <span>Открыть реестр</span>
              <ArrowRight className="h-3.5 w-3.5 ml-1" />
            </div>
          </div>

          {/* Card 2 */}
          <div
            onClick={onOpenPaymentModal}
            className="p-7 bg-[#f6faf8] dark:bg-[#0f151d] hover:bg-[#edf6f3] dark:hover:bg-[#131d27] border border-[#e1efe9] dark:border-slate-800 rounded-3xl transition-all cursor-pointer group shadow-xs flex flex-col justify-between space-y-6"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="h-9 w-9 rounded-xl bg-white dark:bg-[#182330] border border-teal-100 dark:border-slate-700 flex items-center justify-center text-teal-800 dark:text-teal-300 shadow-xs">
                  <GraduationCap className="h-4 w-4" />
                </div>
                <div className="h-7 w-7 rounded-full bg-white dark:bg-[#182330] border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-300 group-hover:bg-[#0b2b2a] dark:group-hover:bg-teal-700 group-hover:text-white transition-colors text-xs font-medium">
                  +
                </div>
              </div>

              <h3 className="text-lg font-semibold tracking-tight text-slate-900 dark:text-white group-hover:text-teal-900 dark:group-hover:text-teal-300 transition-colors">
                Оплата семестра или общежития
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-normal">
                Удобная форма с фиксированным выпадающим списком (1-4 курсы от 450 000 ₸ или общежитие 110 000 ₸) и автоматическим расчетом суммы.
              </p>
            </div>

            <div className="flex items-center text-xs font-semibold text-teal-800 dark:text-teal-400 group-hover:translate-x-1 transition-transform">
              <span>Заполнить форму</span>
              <ArrowRight className="h-3.5 w-3.5 ml-1" />
            </div>
          </div>

          {/* Card 3 */}
          <div
            onClick={onGoToBatch}
            className="p-7 bg-[#f6faf8] dark:bg-[#0f151d] hover:bg-[#edf6f3] dark:hover:bg-[#131d27] border border-[#e1efe9] dark:border-slate-800 rounded-3xl transition-all cursor-pointer group shadow-xs flex flex-col justify-between space-y-6"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="h-9 w-9 rounded-xl bg-white dark:bg-[#182330] border border-teal-100 dark:border-slate-700 flex items-center justify-center text-teal-800 dark:text-teal-300 shadow-xs">
                  <Layers className="h-4 w-4" />
                </div>
                <div className="h-7 w-7 rounded-full bg-white dark:bg-[#182330] border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-300 group-hover:bg-[#0b2b2a] dark:group-hover:bg-teal-700 group-hover:text-white transition-colors text-xs font-medium">
                  +
                </div>
              </div>

              <h3 className="text-lg font-semibold tracking-tight text-slate-900 dark:text-white group-hover:text-teal-900 dark:group-hover:text-teal-300 transition-colors">
                Пакетный клиринг (10+)
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-normal">
                Инструмент для представителей вузов: одновременный ввод списка студентов и упаковка 10+ транзакций в один блокчейн-блок.
              </p>
            </div>

            <div className="flex items-center text-xs font-semibold text-teal-800 dark:text-teal-400 group-hover:translate-x-1 transition-transform">
              <span>Пакетная таблица</span>
              <ArrowRight className="h-3.5 w-3.5 ml-1" />
            </div>
          </div>

        </div>
      </div>

      {/* SECTION 3: Dark Forest Contrast Block */}
      <div className="bg-[#0b2b2a] dark:bg-[#071c1b] border border-transparent dark:border-teal-900/60 text-white rounded-[32px] p-8 sm:p-12 shadow-lg relative overflow-hidden">
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          
          <div className="lg:col-span-7 space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-teal-500/20 border border-teal-400/30 rounded-full text-teal-300 text-xs font-semibold">
              <span>Цифровой студенческий ID</span>
            </div>
            
            <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight text-white leading-tight">
              Электронный паспорт студента с подтверждением в блокчейне
            </h2>
            
            <p className="text-xs sm:text-sm text-teal-100/70 font-light leading-relaxed max-w-lg">
              Каждый зарегистрированный платеж формирует цифровой чек с QR-кодом. 
              Комендант общежития или куратор группы может за 2 секунды со смартфона проверить статус проживания и оплату семестра.
            </p>

            <div className="pt-2">
              <button
                onClick={onOpenPaymentModal}
                className="px-6 py-2.5 text-xs font-semibold text-[#0b2b2a] bg-teal-200 hover:bg-teal-100 rounded-full transition-all cursor-pointer shadow-sm active:scale-95"
              >
                Оформить платеж
              </button>
            </div>
          </div>

          {/* Translucent Frosted Card Graphic */}
          <div className="lg:col-span-5 flex justify-center">
            <div className="w-full max-w-sm p-6 bg-gradient-to-br from-teal-700/40 to-teal-900/60 backdrop-blur-md rounded-3xl border border-teal-400/30 shadow-2xl space-y-6 text-white">
              <div className="flex items-center justify-between text-xs text-teal-200">
                <span className="font-semibold">UniChain Student Pass</span>
                <span className="font-mono text-[10px]">VERIFIED</span>
              </div>

              <div className="py-2 space-y-1">
                <div className="text-[10px] text-teal-300 uppercase tracking-wider">Студент</div>
                <div className="text-lg font-semibold tracking-wide">Бақыт Ерланов</div>
                <div className="text-xs text-teal-200/80">КазНУ им. аль-Фараби · ФИТ</div>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-teal-500/30 text-[11px] font-mono text-teal-200">
                <span>ИИН: 030814501289</span>
                <span className="text-teal-300">Room 412 ✓</span>
              </div>
            </div>
          </div>

        </div>

      </div>

      {/* SECTION: Public Solana Devnet On-Chain Records (Memo Program) */}
      <div className="p-6 sm:p-8 bg-white dark:bg-[#0f141c] border border-slate-200/90 dark:border-slate-800/80 rounded-3xl shadow-xs transition-colors">
        <SolanaRecordsList
          records={getStoredSolanaRecords()}
          title="Публичный реестр записей в блокчейне (Solana Devnet Memo)"
        />
      </div>

      {/* SECTION 4: Supported Universities in KZ */}
      <div className="space-y-4 pt-2">
        <div className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
          Подключенные университеты Казахстана ({UNIVERSITIES.length})
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {UNIVERSITIES.map(u => (
            <div
              key={u.id}
              className="p-4 bg-white dark:bg-[#0f141c] border border-slate-200/80 dark:border-slate-800 hover:border-teal-300 dark:hover:border-teal-700 rounded-2xl text-xs space-y-1 transition-all shadow-2xs hover:shadow-xs"
            >
              <div className="font-semibold text-slate-900 dark:text-white truncate">{u.abbreviation}</div>
              <div className="text-slate-500 dark:text-slate-400 text-[11px] truncate">{u.city} · {u.dormitories.length} общежитий</div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
