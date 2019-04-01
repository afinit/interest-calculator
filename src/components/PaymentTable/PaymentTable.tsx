import React from 'react';

import { LoanState, CalculatorState } from '../../containers/Calculator/Calculator';

interface LoanTrack {
    principal: number;
    interestRate: number;
    loanLength: number;
    loanMonthlyPayment: number;
    interestPayment: number;
    principalPayment: number;
    [key: string]: number;
}

interface MonthlyUpdate {
    loans: Array<LoanTrack>;
    cashAcc: number;
}

const createLoanTrackCopies = (loans: Array<LoanState>) => {
    return loans.map(loan => {
        return {
            ...loan,
            interestPayment: 0,
            principalPayment: 0,
        }
    })
}

const createMonthlyUpdateCopy = (monthlyUpdate: MonthlyUpdate) => {
    return {
        loans: createLoanTrackCopies(monthlyUpdate.loans),
        cashAcc: monthlyUpdate.cashAcc,
    }
}

const applyPayment = (loan: LoanTrack, payment: number) => {
    const loanCopy = {...loan};
    let appliedPayment = payment;

    if (loanCopy.principal < appliedPayment) appliedPayment = loanCopy.principal;

    loanCopy.principal -= appliedPayment;
    loanCopy.principalPayment += appliedPayment;

    return loanCopy;
}

const applyRawPayment = (loan: LoanTrack) => {
    let payment = 0;
    let interestPayment = 0;

    if (loan.principal > 0) {
        interestPayment = loan.interestRate * loan.principal / 12.0;
        payment = loan.loanMonthlyPayment - interestPayment;
        if (payment > loan.principal) payment = loan.principal;
    }

    const adjLoan = applyPayment(loan, payment);
    adjLoan.interestPayment = interestPayment;

    return adjLoan;
}

const applyAdditionalPayment = (loans: Array<LoanTrack>, payment: number) => {
    const adjLoans = [];
    let paymentLeft = payment;

    for (let i = 0; i <= loans.length; i++) {
        const adjLoan = applyPayment(loans[i], paymentLeft);
        paymentLeft -= loans[i].principal - adjLoan.principal;
        adjLoans.push(adjLoan)
    }

    return adjLoans;
}

const applyAdditionalPaymentReduce = (acc: {loans: Array<LoanTrack>, payment: number}, loan: LoanTrack) => {
    const adjLoan = applyPayment(loan, acc.payment);
    const payment = acc.payment - (loan.principal - adjLoan.principal);

    return {loans: acc.loans.concat(adjLoan), payment};
}

const calcMonthlyUpdates = (loans: Array<LoanState>, additionalPayment: number, extraSavings: number, savingsInterestRate: number, applyClosedLoanPayment: boolean) => {
    const monthlyUpdate: MonthlyUpdate = {
        loans: createLoanTrackCopies(loans)
            .sort((a, b) => {
                if(a.interestRate > b.interestRate) return -1
                else if (a.interestRate < b.interestRate) return 1
                else return 0
            }),
        cashAcc: 0,
    }

    let monthlyUpdates: Array<MonthlyUpdate> = [];

    const longestLoan = Math.max(...monthlyUpdate.loans.map(loan => loan.loanLength))
    console.log("longestLoan: ", longestLoan);

    for (let i = 0; i < longestLoan; i++) {
        let moUpCopy: MonthlyUpdate = monthlyUpdates.length === 0 ? 
            createMonthlyUpdateCopy(monthlyUpdate) : 
            createMonthlyUpdateCopy(monthlyUpdates[monthlyUpdates.length - 1]);
        let moUpLoans = moUpCopy.loans

        // apply array of raw payment to each loan
        moUpLoans = moUpLoans.map(applyRawPayment);

        // calculate remainder payment from paid off loans.. combine with props.additionalPayment
        const leftOverPaymentSum = moUpLoans.reduce(
            (acc, loan) =>
                (loan.loanMonthlyPayment - loan.interestPayment - loan.principalPayment) > 0.005 ?
                    acc + loan.loanMonthlyPayment - loan.interestPayment - loan.principalPayment : acc,
            0
        )

        // apply additional payments to each loan with reduce.. maybe reuse applyPayment method here?
        const additionalPaymentResult = moUpLoans.reduce(applyAdditionalPaymentReduce, {loans: [], payment: leftOverPaymentSum + additionalPayment});
        moUpLoans = additionalPaymentResult.loans;
        moUpCopy.cashAcc *= 1 + savingsInterestRate;
        moUpCopy.cashAcc += additionalPaymentResult.payment + extraSavings;
        moUpCopy.loans = moUpLoans;

        monthlyUpdates.push(moUpCopy);
    }

    return monthlyUpdates;
}

const paymentTable = (props: CalculatorState) => {
    const monthlyUpdates = calcMonthlyUpdates(props.loans, 0, props.additionalPayment, props.savingsInterestRate, props.applyClosedLoanPayment);

    let monthlyUpdatesWAdd: Array<MonthlyUpdate> = [];
    if (props.additionalPayment > 0) {
        monthlyUpdatesWAdd = calcMonthlyUpdates(props.loans, props.additionalPayment, 0, props.savingsInterestRate, props.applyClosedLoanPayment);
    }
    console.log(monthlyUpdates);

    const additionalPaymentHeader = [
        <th key="thSavings">Savings</th>,
        <th key="thPrinc">Principal with Add</th>,
        <th key="thIntPay">Interest Payment with Add</th>,
        <th key="thPrincPay">Principal Payment with Add</th>,
        <th key="thSavingsWAdd">Savings with Add</th>,
    ]

    return (
        <div>
            <p>Total Cost of Loans: {
                monthlyUpdates.flatMap(month => month.loans.map(loan => loan.interestPayment + loan.principalPayment))
                    .reduce((a,b) => a + b).toFixed(2)
            }</p>
            {props.additionalPayment > 0 ?
                <p>Total Cost of Loans with Additional Payment: {
                    monthlyUpdatesWAdd.flatMap(month => month.loans.map(loan => loan.interestPayment + loan.principalPayment))
                        .reduce((a,b) => a + b).toFixed(2)
                }</p> : null
            }
            <table>
                <thead>
                    <tr>
                        <th>Month</th>
                        <th>Principal</th>
                        <th>Interest Payment</th>
                        <th>Principal Payment</th>
                        {props.additionalPayment > 0 ? additionalPaymentHeader : null }
                    </tr>
                </thead>
                <tbody>
                    {monthlyUpdates.map((month, idx) =>
                        <tr key={idx}>
                            <td>{idx}</td>
                            <td>{month.loans.map(loan => loan.principal).reduce((a, b) => a + b).toFixed(2)}</td>
                            <td>{month.loans.map(loan => loan.interestPayment).reduce((a, b) => a + b).toFixed(2)}</td>
                            <td>{month.loans.map(loan => loan.principalPayment).reduce((a, b) => a + b).toFixed(2)}</td>
                            {props.additionalPayment > 0 ?
                                [
                                    <td key="tdSavings">{month.cashAcc.toFixed(2)}</td>,
                                    <td key="tdPrinc">{monthlyUpdatesWAdd[idx].loans.map(loan => loan.principal).reduce((a, b) => a + b).toFixed(2)}</td>,
                                    <td key="tdIntPay">{monthlyUpdatesWAdd[idx].loans.map(loan => loan.interestPayment).reduce((a, b) => a + b).toFixed(2)}</td>,
                                    <td key="tdPrincPay">{monthlyUpdatesWAdd[idx].loans.map(loan => loan.principalPayment).reduce((a, b) => a + b).toFixed(2)}</td>,
                                    <td key="tdSavingsWAdd">{monthlyUpdatesWAdd[idx].cashAcc.toFixed(2)}</td>,
                                ] : null
                            }
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
}

export default paymentTable;