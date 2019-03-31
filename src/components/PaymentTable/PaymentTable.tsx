import React from 'react';

import { LoanState, CalculatorState } from '../../containers/Calculator/Calculator';

interface LoanTrack {
    principal: number;
    interestRate: number;
    loanLength: number;
    loanMonthlyPayment: number;
    interestPayment: number;
    principalPayment: number;
    totalPayment: number;
    [key: string]: number;
}

const createLoanTrackCopies = (loans: Array<LoanTrack>) => {
    return loans.map(loan => {
        return {
            principal: loan.principal,
            interestRate: loan.interestRate,
            loanLength: loan.loanLength,
            loanMonthlyPayment: loan.loanMonthlyPayment,
            interestPayment: 0,
            principalPayment: 0,
            totalPayment: 0
        }
    })
}

const applyPayment = (loan: LoanTrack, payment: number) => {
    const loanCopy = {...loan};
    let appliedPayment = payment;

    if (loanCopy.principal < appliedPayment) appliedPayment = loanCopy.principal;

    loanCopy.principal -= appliedPayment;
    loanCopy.principalPayment += appliedPayment;
    loanCopy.totalPayment += appliedPayment;

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
    adjLoan.totalPayment += interestPayment;

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

const paymentTable = (props: CalculatorState) => {
    const loansCopy: Array<LoanState> = JSON.parse(JSON.stringify(props.loans));
    const loanTrack: Array<LoanTrack> = loansCopy.map((loan: LoanState) => {
        return { ...loan, interestPayment: 0, principalPayment: 0, totalPayment: 0 }
    })
    .sort((a, b) => {
        if(a.interestRate > b.interestRate) return -1
        else if (a.interestRate < b.interestRate) return 1
        else return 0
    });
    // const interestRates = props.loans.map(loan => loan.interestRate);
    // const loanIdxSorted = interestRates.map((rate, idx) => [rate, idx])
    //     .sort((a,b) => a[0] - b[0])
    //     .map(x => x[1]);

    let monthlyUpdates: Array<Array<LoanTrack>> = [];

    // var totalPrincipal = loans.map(loan => loan.principal).reduce((acc, elem) => acc + elem);
    const longestLoan = Math.max(...loanTrack.map(loan => loan.loanLength))
    console.log("longestLoan: ", longestLoan);

    for (let i = 0; i < longestLoan; i++) {
        let loanTrackCopy: Array<LoanTrack> = monthlyUpdates.length === 0 ? 
            createLoanTrackCopies(loanTrack) : 
            createLoanTrackCopies(monthlyUpdates[monthlyUpdates.length - 1]);

        console.log(i, loanTrackCopy)

        // apply array of raw payment to each loan
        loanTrackCopy = loanTrackCopy.map(applyRawPayment);
        console.log(i, loanTrackCopy)

        // calculate remainder payment from paid off loans.. combine with props.additionalPayment
        const leftOverPaymentSum = loanTrackCopy.reduce(
            (acc, loan) =>
                (loan.loanMonthlyPayment - loan.totalPayment) > 0.005 ?
                    acc + loan.loanMonthlyPayment - loan.totalPayment : acc,
            0
        )

        // apply additional payments to each loan with reduce.. maybe reuse applyPayment method here?
        loanTrackCopy = loanTrackCopy.reduce(applyAdditionalPaymentReduce, {loans: [], payment: leftOverPaymentSum + props.additionalPayment}).loans;
        console.log(i, loanTrackCopy)

        monthlyUpdates.push(loanTrackCopy);
    }

    console.log(monthlyUpdates);
    return (
        <div>
            <p>Total Cost of Loans: {
                monthlyUpdates.flatMap(month => month.map(loan => loan.totalPayment))
                    .reduce((a,b) => a + b).toFixed(2)
            }</p>
            <table>
                <thead>
                    <tr>
                        <th>Month</th>
                        <th>Principal</th>
                        <th>Interest Payment</th>
                        <th>Principal Payment</th>
                        <th>Total Payment</th>
                    </tr>
                </thead>
                <tbody>
                    {monthlyUpdates.map((month, idx) =>
                        <tr key={idx}>
                            <td>{idx}</td>
                            <td>{month.map(loan => loan.principal).reduce((a, b) => a + b).toFixed(2)}</td>
                            <td>{month.map(loan => loan.interestPayment).reduce((a, b) => a + b).toFixed(2)}</td>
                            <td>{month.map(loan => loan.principalPayment).reduce((a, b) => a + b).toFixed(2)}</td>
                            <td>{month.map(loan => loan.totalPayment).reduce((a, b) => a + b).toFixed(2)}</td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
}

export default paymentTable;